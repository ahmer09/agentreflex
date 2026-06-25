import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const HOOK = "arx hook --agent windsurf";
const EVENTS = ["pre_run_command", "pre_write_code"];

interface ToolInfo {
  command_line?: string;
  cwd?: string;
  file_path?: string;
}
interface Payload {
  tool_info?: ToolInfo;
  cwd?: string;
}
interface Entry {
  command: string;
  working_directory?: string;
}
interface Config {
  hooks?: Record<string, Entry[]>;
  [k: string]: unknown;
}

const file = (s: Scope) =>
  s === "global"
    ? path.join(os.homedir(), ".codeium", "windsurf", "hooks.json")
    : path.join(process.cwd(), ".windsurf", "hooks.json");
const isOurs = (e: Entry) => typeof e.command === "string" && e.command.includes("hook --agent");

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

export const windsurf: Adapter = {
  name: "windsurf",
  label: "Windsurf",
  enforces: true,
  // Cascade pre-hooks block by exiting 2; there's no native "ask".
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    const info = p.tool_info ?? {};
    const isWrite = typeof info.file_path === "string";
    return {
      event: "onToolCall",
      agent: "windsurf",
      tool: isWrite ? "Write" : "Bash",
      command: typeof info.command_line === "string" ? info.command_line : undefined,
      paths: isWrite && info.file_path ? [info.file_path] : [],
      cwd: info.cwd ?? p.cwd ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny") return {};
    return { stderr: decision.reason, exit: 2 };
  },

  install(scope) {
    const f = file(scope);
    const config = read(f);
    config.hooks ??= {};
    let changed = false;
    for (const ev of EVENTS) {
      const list = config.hooks[ev] ?? [];
      if (!list.some(isOurs)) {
        list.push({ command: HOOK });
        changed = true;
      }
      config.hooks[ev] = list;
    }
    write(f, config);
    return { file: f, changed };
  },

  uninstall(scope) {
    const f = file(scope);
    if (!fs.existsSync(f)) return { file: f, changed: false };
    const config = read(f);
    if (!config.hooks) return { file: f, changed: false };
    let changed = false;
    for (const ev of Object.keys(config.hooks)) {
      const list = config.hooks[ev] ?? [];
      const next = list.filter((e) => !isOurs(e));
      if (next.length !== list.length) {
        config.hooks[ev] = next;
        changed = true;
      }
    }
    if (changed) write(f, config);
    return { file: f, changed };
  },

  isInstalled() {
    return (
      fs.existsSync(path.join(os.homedir(), ".codeium", "windsurf")) ||
      fs.existsSync(path.join(process.cwd(), ".windsurf"))
    );
  },
};
