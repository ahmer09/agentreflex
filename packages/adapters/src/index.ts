import type { Adapter, Scope } from "@agentreflex/core";
import { claude } from "./claude.js";
import { codex } from "./codex.js";
import { copilot } from "./copilot.js";
import { cursor } from "./cursor.js";
import { gemini } from "./gemini.js";
import { opencode } from "./opencode.js";
import { windsurf } from "./windsurf.js";

/** Every supported agent. New agents are added here. */
export const ADAPTERS: Adapter[] = [claude, copilot, cursor, gemini, windsurf, opencode, codex];

export function getAdapter(name: string): Adapter | undefined {
  return ADAPTERS.find((a) => a.name === name);
}

/** An explicit list, "all", or — by default — the agents installed on this machine. */
export function resolveAdapters(requested: string[], scope: Scope): Adapter[] {
  if (requested.includes("all")) return ADAPTERS;
  if (requested.length > 0) {
    return requested.map(getAdapter).filter((a): a is Adapter => a !== undefined);
  }
  return ADAPTERS.filter((a) => a.isInstalled(scope));
}

export { claude, copilot, cursor, gemini, windsurf, opencode, codex };
