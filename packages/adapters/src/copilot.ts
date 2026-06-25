import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const HOOK = "arx hook --agent copilot";

/** Copilot's lowercase tool names → canonical PascalCase. */
const TOOL_MAP: Record<string, string> = {
  bash: "Bash",
  edit: "Edit",
  write: "Write",
  view: "Read",
};

interface Payload {
  toolName?: string;
  toolArgs?: unknown;
  cwd?: string;
}

const hookFile = (s: Scope) =>
  s === "global"
    ? path.join(os.homedir(), ".copilot", "hooks", "agentreflex.json")
    : path.join(process.cwd(), ".github", "hooks", "agentreflex.json");

function readCommand(args: unknown): string | undefined {
  if (typeof args === "string") return args;
  if (
    args &&
    typeof args === "object" &&
    typeof (args as { command?: unknown }).command === "string"
  ) {
    return (args as { command: string }).command;
  }
  return undefined;
}
function readPaths(args: unknown): string[] {
  if (args && typeof args === "object") {
    const a = args as Record<string, unknown>;
    for (const k of ["file_path", "filePath", "path"]) {
      if (typeof a[k] === "string") return [a[k] as string];
    }
  }
  return [];
}

export const copilot: Adapter = {
  name: "copilot",
  label: "GitHub Copilot CLI",
  enforces: true,
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny", "ask"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    const raw = (p.toolName ?? "").toLowerCase();
    return {
      event: "onToolCall",
      agent: "copilot",
      tool: TOOL_MAP[raw] ?? (raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : ""),
      command: readCommand(p.toolArgs),
      paths: readPaths(p.toolArgs),
      cwd: p.cwd ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny" && decision.action !== "ask") return {};
    return {
      stdout: JSON.stringify({
        permissionDecision: decision.action,
        permissionDecisionReason: decision.reason,
      }),
    };
  },

  install(scope) {
    const file = hookFile(scope);
    const changed = !fs.existsSync(file);
    const config = {
      version: 1,
      hooks: { preToolUse: [{ type: "command", bash: HOOK, matcher: "bash|edit|write" }] },
    };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
    return { file, changed };
  },

  uninstall(scope) {
    const file = hookFile(scope);
    const changed = fs.existsSync(file);
    fs.rmSync(file, { force: true });
    return { file, changed };
  },

  isInstalled() {
    return fs.existsSync(path.join(os.homedir(), ".copilot"));
  },
};
