import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const HOOK = "arx hook --agent claude";
const MATCHER = "Bash|Edit|MultiEdit|Write";

interface Settings {
  hooks?: {
    PreToolUse?: Array<{ matcher?: string; hooks: Array<{ type: string; command: string }> }>;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
interface Payload {
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  cwd?: string;
}

const dir = (s: Scope) => path.join(s === "global" ? os.homedir() : process.cwd(), ".claude");
const settingsFile = (s: Scope) => path.join(dir(s), "settings.json");

function read(file: string): Settings {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Settings;
  } catch {
    return {};
  }
}
function write(file: string, settings: Settings): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
}

export const claude: Adapter = {
  name: "claude",
  label: "Claude Code",
  enforces: true,
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny", "ask"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    const input = p.tool_input ?? {};
    const paths: string[] = [];
    if (typeof input.file_path === "string") paths.push(input.file_path);
    return {
      event: "onToolCall",
      agent: "claude",
      tool: p.tool_name ?? "",
      command: typeof input.command === "string" ? input.command : undefined,
      paths,
      cwd: p.cwd ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny" && decision.action !== "ask") return {};
    return {
      stdout: JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: decision.action,
          permissionDecisionReason: decision.reason,
        },
      }),
    };
  },

  install(scope) {
    const file = settingsFile(scope);
    const settings = read(file);
    settings.hooks ??= {};
    settings.hooks.PreToolUse ??= [];
    const pre = settings.hooks.PreToolUse;
    const already = pre.some((m) => m.hooks?.some((h) => h.command === HOOK));
    if (!already) {
      pre.push({ matcher: MATCHER, hooks: [{ type: "command", command: HOOK }] });
      write(file, settings);
    }
    return { file, changed: !already };
  },

  uninstall(scope) {
    const file = settingsFile(scope);
    if (!fs.existsSync(file)) return { file, changed: false };
    const settings = read(file);
    const pre = settings.hooks?.PreToolUse;
    if (!pre) return { file, changed: false };
    let changed = false;
    for (const m of pre) {
      const before = m.hooks?.length ?? 0;
      if (m.hooks) m.hooks = m.hooks.filter((h) => !h.command.includes("hook --agent"));
      if ((m.hooks?.length ?? 0) !== before) changed = true;
    }
    if (settings.hooks) settings.hooks.PreToolUse = pre.filter((m) => (m.hooks?.length ?? 0) > 0);
    if (changed) write(file, settings);
    return { file, changed };
  },

  isInstalled(scope) {
    return fs.existsSync(dir(scope));
  },
};
