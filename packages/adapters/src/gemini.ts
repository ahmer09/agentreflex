import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const HOOK = "arx hook --agent gemini";
const MATCHER = "run_shell_command|write_file|replace";

const TOOL_MAP: Record<string, string> = {
  run_shell_command: "Bash",
  write_file: "Write",
  replace: "Edit",
  read_file: "Read",
};

interface Payload {
  tool_name?: string;
  tool_input?: unknown;
  cwd?: string;
}
interface HookCmd {
  name?: string;
  type?: string;
  command?: string;
}
interface Group {
  matcher?: string;
  hooks?: HookCmd[];
}
interface Config {
  hooks?: { BeforeTool?: Group[]; [k: string]: unknown };
  [k: string]: unknown;
}

const file = (s: Scope) =>
  path.join(s === "global" ? os.homedir() : process.cwd(), ".gemini", "settings.json");
const isOurs = (g: Group) =>
  (g.hooks ?? []).some((h) => typeof h.command === "string" && h.command.includes("hook --agent"));

function read(f: string): Config {
  try {
    return JSON.parse(fs.readFileSync(f, "utf8")) as Config;
  } catch {
    return {};
  }
}
function write(f: string, config: Config): void {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, `${JSON.stringify(config, null, 2)}\n`);
}

function readCommand(args: unknown): string | undefined {
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
    for (const k of ["file_path", "absolute_path", "path"]) {
      if (typeof a[k] === "string") return [a[k] as string];
    }
  }
  return [];
}

export const gemini: Adapter = {
  name: "gemini",
  label: "Gemini CLI",
  enforces: true,
  // BeforeTool supports allow/deny only — no native "ask".
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    const raw = p.tool_name ?? "";
    return {
      event: "onToolCall",
      agent: "gemini",
      tool: TOOL_MAP[raw] ?? raw,
      command: readCommand(p.tool_input),
      paths: readPaths(p.tool_input),
      cwd: p.cwd ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny") return {};
    return { stdout: JSON.stringify({ decision: "deny", reason: decision.reason }) };
  },

  install(scope) {
    const f = file(scope);
    const config = read(f);
    config.hooks ??= {};
    if (!config.hooks.BeforeTool) config.hooks.BeforeTool = [];
    const groups = config.hooks.BeforeTool;
    const already = groups.some(isOurs);
    if (!already) {
      groups.push({
        matcher: MATCHER,
        hooks: [{ name: "agentreflex", type: "command", command: HOOK }],
      });
    }
    write(f, config);
    return { file: f, changed: !already };
  },

  uninstall(scope) {
    const f = file(scope);
    if (!fs.existsSync(f)) return { file: f, changed: false };
    const config = read(f);
    const hooks = config.hooks;
    const groups = hooks?.BeforeTool;
    if (!hooks || !Array.isArray(groups)) return { file: f, changed: false };
    const next = groups.filter((g) => !isOurs(g));
    const changed = next.length !== groups.length;
    if (changed) {
      hooks.BeforeTool = next;
      write(f, config);
    }
    return { file: f, changed };
  },

  isInstalled() {
    return fs.existsSync(path.join(os.homedir(), ".gemini"));
  },
};
