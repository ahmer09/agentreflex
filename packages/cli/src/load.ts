import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Reflex } from "@agentreflex/core";

export const reflexDir = (cwd: string = process.cwd()) => path.join(cwd, ".reflex");
export const configPath = (cwd: string = process.cwd()) => path.join(reflexDir(cwd), "config.json");

export interface Config {
  reflexes?: Array<string | { source: string }>;
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

/** Load every reflex listed in `.reflex/config.json`. Fails open: a reflex that
 *  can't be resolved is skipped, never fatal. */
export async function loadReflexes(cwd: string = process.cwd()): Promise<Reflex[]> {
  const out: Reflex[] = [];
  for (const entry of readConfig(cwd).reflexes ?? []) {
    const source = typeof entry === "string" ? entry : entry.source;
    const reflex = await importReflex(source, cwd);
    if (reflex) out.push(reflex);
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
