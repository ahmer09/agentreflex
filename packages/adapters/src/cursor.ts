import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, Decision, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

const HOOK = "arx hook --agent cursor";

interface Payload {
  command?: string;
  cwd?: string;
  workspace_roots?: string[];
}
interface Entry {
  command: string;
  matcher?: string;
}
interface Config {
  version?: number;
  hooks?: { beforeShellExecution?: Entry[]; [k: string]: unknown };
  [k: string]: unknown;
}

const file = (s: Scope) =>
  path.join(s === "global" ? os.homedir() : process.cwd(), ".cursor", "hooks.json");
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

export const cursor: Adapter = {
  name: "cursor",
  label: "Cursor",
  enforces: true,
  capabilities: { events: ["onToolCall"], decisions: ["pass", "deny", "ask"] },

  parse(payload): ReflexContext {
    const p = (payload ?? {}) as Payload;
    return {
      event: "onToolCall",
      agent: "cursor",
      tool: "Bash",
      command: typeof p.command === "string" ? p.command : undefined,
      paths: [],
      cwd: p.cwd ?? p.workspace_roots?.[0] ?? process.cwd(),
      raw: payload,
    };
  },

  format(decision: Decision): HookResponse {
    if (decision.action !== "deny" && decision.action !== "ask") return {};
    return {
      stdout: JSON.stringify({
        permission: decision.action,
        user_message: decision.reason,
        agent_message: decision.reason,
      }),
    };
  },

  install(scope) {
    const f = file(scope);
    const config = read(f);
    config.version ??= 1;
    config.hooks ??= {};
    if (!config.hooks.beforeShellExecution) config.hooks.beforeShellExecution = [];
    const list = config.hooks.beforeShellExecution;
    const already = list.some(isOurs);
    if (!already) list.push({ command: HOOK });
    write(f, config);
    return { file: f, changed: !already };
  },

  uninstall(scope) {
    const f = file(scope);
    if (!fs.existsSync(f)) return { file: f, changed: false };
    const config = read(f);
    const hooks = config.hooks;
    const list = hooks?.beforeShellExecution;
    if (!hooks || !Array.isArray(list)) return { file: f, changed: false };
    const next = list.filter((e) => !isOurs(e));
    const changed = next.length !== list.length;
    if (changed) {
      hooks.beforeShellExecution = next;
      write(f, config);
    }
    return { file: f, changed };
  },

  isInstalled() {
    return fs.existsSync(path.join(os.homedir(), ".cursor"));
  },
};
