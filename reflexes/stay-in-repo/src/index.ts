import path from "node:path";
import { type Decision, defineReflex, deny, pass } from "@agentreflex/core";

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

function isOutside(p: string, cwd: string): boolean {
  const rel = path.relative(cwd, path.resolve(cwd, p));
  return rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel);
}

export default defineReflex({
  name: "stay-in-repo",
  onToolCall(ctx): Decision {
    if (!EDIT_TOOLS.has(ctx.tool)) return pass();
    if (ctx.paths.some((p) => isOutside(p, ctx.cwd)))
      return deny("That path is outside the project — agentreflex keeps edits in the repo.");
    return pass();
  },
});
