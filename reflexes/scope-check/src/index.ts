import path from "node:path";
import { type Decision, type ToolCallContext, defineReflex, pass } from "@agentreflex/core";

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit"]);

export interface ScopeCheckOptions {
  allow?: string | string[];
}

function matchesGlob(filePath: string, pattern: string, cwd: string): boolean {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  const rel = path.relative(cwd, abs).replace(/\\/g, "/");
  const escaped = pattern
    .replace(/\\/g, "/")
    .replace(/[.+^${}()|[\]]/g, "\\$&")
    .replace(/\*\*/g, "DOUBLE_STAR")
    .replace(/\*/g, "[^/]*")
    .replace(/DOUBLE_STAR/g, ".*");
  return new RegExp(`^${escaped}$`).test(rel);
}

function isAllowed(filePath: string, patterns: string[], cwd: string): boolean {
  return patterns.some((p) => matchesGlob(filePath, p, cwd));
}

export default defineReflex({
  name: "scope-check",

  async onToolCall(ctx: ToolCallContext): Promise<Decision> {
    if (!WRITE_TOOLS.has(ctx.tool)) return pass();
    if (ctx.paths.length === 0) return pass();

    const opts = (ctx.options ?? {}) as ScopeCheckOptions;
    const rawAllow = opts.allow;

    // No allow option configured → no constraints, pass through.
    if (rawAllow === undefined) return pass();

    const allow: string[] = Array.isArray(rawAllow)
      ? rawAllow
      : typeof rawAllow === "string"
        ? [rawAllow]
        : [];

    // Explicit allow: [] means "nothing is permitted" → deny all writes.
    if (allow.length === 0) {
      return {
        action: "deny",
        reason:
          "scope-check: allow list is empty — all writes are blocked. Add patterns to the `allow` list in .reflex/config.json to permit writes.",
      };
    }

    for (const filePath of ctx.paths) {
      if (!isAllowed(filePath, allow, ctx.cwd)) {
        return {
          action: "deny",
          reason: `scope-check: "${filePath}" is outside the allowed scope (${allow.join(", ")}). Update the \`allow\` list in .reflex/config.json to expand the scope, or confirm this is intentional with the user.`,
        };
      }
    }

    return pass();
  },
});
