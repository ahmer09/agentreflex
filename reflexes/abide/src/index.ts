import fs from "node:fs";
import path from "node:path";
import {
  type Decision,
  type ToolCallContext,
  commandMatches,
  defineReflex,
} from "@agentreflex/core";
import { parse } from "yaml";

type Action = "deny" | "ask";

interface Rule {
  description: string;
  action: Action;
  tool?: string | string[];
  command?: string | string[];
  pathOutsideProject?: boolean;
}

const DEFAULTS: Rule[] = [
  {
    description: "Never force-push.",
    action: "deny",
    command: ["git push*--force*", "git push*-f*"],
  },
  { description: "Ask before pushing.", action: "ask", command: ["git push*"] },
  {
    description: "Don't edit files outside the project.",
    action: "deny",
    tool: ["Edit", "Write", "MultiEdit"],
    pathOutsideProject: true,
  },
];

function asArray<T>(v: T | T[] | undefined): T[] {
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

function loadRules(cwd: string): Rule[] {
  const file = path.join(cwd, ".reflex", "abide.yaml");
  if (!fs.existsSync(file)) return DEFAULTS;
  try {
    const data = parse(fs.readFileSync(file, "utf8")) as { rules?: Rule[] } | null;
    return data?.rules ?? DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function isOutside(p: string, cwd: string): boolean {
  const rel = path.relative(cwd, path.resolve(cwd, p));
  return rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel);
}

function matches(rule: Rule, ctx: ToolCallContext): boolean {
  const tools = asArray(rule.tool);
  if (tools.length > 0 && !tools.includes(ctx.tool)) return false;

  const commands = asArray(rule.command);
  if (commands.length > 0) {
    if (!ctx.command) return false;
    if (!commandMatches(ctx.command, commands)) return false;
  }

  if (rule.pathOutsideProject && !ctx.paths.some((p) => isOutside(p, ctx.cwd))) return false;

  return tools.length > 0 || commands.length > 0 || Boolean(rule.pathOutsideProject);
}

export default defineReflex({
  name: "abide",
  onToolCall(ctx): Decision {
    for (const rule of loadRules(ctx.cwd)) {
      if (matches(rule, ctx)) return { action: rule.action, reason: rule.description };
    }
    return { action: "pass" };
  },
});
