import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const TOOL_MAP: Record<string, string> = {
  bash: "Bash",
  edit: "Edit",
  write: "Write",
  read: "Read",
};

interface Payload {
  tool?: string;
  args?: Record<string, unknown>;
  cwd?: string;
}

// A self-contained OpenCode plugin that bridges tool.execute.before into the
// agentreflex dispatcher and throws (OpenCode's deny) when a reflex blocks.
const PLUGIN = `import { execFileSync } from "node:child_process";

export const agentreflex = async () => ({
  "tool.execute.before": async (input, output) => {
    const payload = JSON.stringify({ tool: input.tool, args: output.args, cwd: process.cwd() });
    let out = "";
    try {
      out = execFileSync("arx", ["hook", "--agent", "opencode"], { input: payload }).toString();
    } catch {}
    if (!out) return;
    let decision;
    try { decision = JSON.parse(out); } catch { return; }
    if (decision && decision.block) throw new Error(decision.reason || "blocked by agentreflex");
  },
});
`;

const pluginFile = (s: Scope) =>
  s === "global"
    ? path.join(os.homedir(), ".config", "opencode", "plugins", "agentreflex.js")
    : path.join(process.cwd(), ".opencode", "plugins", "agentreflex.js");

export const opencode: Adapter = {
  name: "opencode",
  label: "OpenCode",
  enforces: true,
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    const raw = (p.tool ?? "").toLowerCase();
    const args = p.args ?? {};
    return {
      event: "onToolCall",
      agent: "opencode",
      tool: TOOL_MAP[raw] ?? (raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : ""),
      command: typeof args.command === "string" ? args.command : undefined,
      paths: typeof args.filePath === "string" ? [args.filePath] : [],
      cwd: p.cwd ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny") return {};
    return { stdout: JSON.stringify({ block: true, reason: decision.reason }) };
  },

  install(scope) {
    const f = pluginFile(scope);
    const changed = !fs.existsSync(f);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, PLUGIN);
    return { file: f, changed };
  },

  uninstall(scope) {
    const f = pluginFile(scope);
    const changed = fs.existsSync(f);
    fs.rmSync(f, { force: true });
    return { file: f, changed };
  },

  isInstalled() {
    return (
      fs.existsSync(path.join(os.homedir(), ".config", "opencode")) ||
      fs.existsSync(path.join(process.cwd(), ".opencode"))
    );
  },
};
