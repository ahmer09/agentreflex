import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Adapter, HookResponse, ReflexContext, Scope } from "@agentreflex/core";

/**
 * Codex has no programmable pre-tool hook, so it can't block at runtime. It's an
 * advisory target: reflexes are compiled to `AGENTS.md`, which Codex reads. The
 * adapter is here so the capability matrix can show it honestly as advisory.
 */
const agentsFile = (s: Scope) =>
  path.join(s === "global" ? os.homedir() : process.cwd(), "AGENTS.md");

export const codex: Adapter = {
  name: "codex",
  label: "Codex",
  enforces: false,
  capabilities: { events: [], decisions: ["pass"] },

  parse(payload): ReflexContext {
    return {
      event: "onToolCall",
      agent: "codex",
      tool: "",
      paths: [],
      cwd: process.cwd(),
      raw: payload,
    };
  },

  format(): HookResponse {
    return {};
  },

  install(scope) {
    return { file: agentsFile(scope), changed: false };
  },

  uninstall(scope) {
    return { file: agentsFile(scope), changed: false };
  },

  isInstalled(scope) {
    return fs.existsSync(agentsFile(scope));
  },
};
