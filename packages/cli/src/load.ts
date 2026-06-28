import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Reflex } from "@agentreflex/core";

export const reflexDir = (cwd: string = process.cwd()) => path.join(cwd, ".reflex");
export const configPath = (cwd: string = process.cwd()) => path.join(reflexDir(cwd), "config.json");

export interface ReflexEntry {
  source: string;
  /** Options handed to the reflex as `ctx.options` on every call. */
  with?: Record<string, unknown>;
}

export interface Config {
  reflexes?: Array<string | ReflexEntry>;
}

export function readConfig(cwd: string = process.cwd()): Config {
  try {
    return JSON.parse(fs.readFileSync(configPath(cwd), "utf8")) as Config;
  } catch {
    return {};
  }
}

export function writeConfig(cwd: string, config: Config): void {
  fs.mkdirSync(reflexDir(cwd), { recursive: true });
  fs.writeFileSync(configPath(cwd), `${JSON.stringify(config, null, 2)}\n`);
}

/** Bind config options to a reflex so every handler sees them as `ctx.options`.
 *  The authored reflex is left untouched. */
function withOptions(reflex: Reflex, options: Record<string, unknown>): Reflex {
  const { onToolCall, onToolResult } = reflex;
  return {
    name: reflex.name,
    onToolCall: onToolCall ? (ctx) => onToolCall({ ...ctx, options }) : undefined,
    onToolResult: onToolResult ? (ctx) => onToolResult({ ...ctx, options }) : undefined,
  };
}

/** Load every reflex listed in `.reflex/config.json`. Fails open: a reflex that
 *  can't be resolved is skipped, never fatal. */
export async function loadReflexes(cwd: string = process.cwd()): Promise<Reflex[]> {
  const out: Reflex[] = [];
  for (const entry of readConfig(cwd).reflexes ?? []) {
    const source = typeof entry === "string" ? entry : entry.source;
    const options = typeof entry === "string" ? undefined : entry.with;
    const reflex = await importReflex(source, cwd);
    if (reflex) out.push(options ? withOptions(reflex, options) : reflex);
  }
  return out;
}

async function importReflex(source: string, cwd: string): Promise<Reflex | null> {
  try {
    const spec =
      source.startsWith(".") || source.startsWith("/")
        ? pathToFileURL(path.resolve(reflexDir(cwd), source)).href
        : source;
    const mod = (await import(spec)) as { default?: Reflex; reflex?: Reflex };
    return mod.default ?? mod.reflex ?? null;
  } catch {
    return null;
  }
}
