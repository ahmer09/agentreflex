import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { type ToolCallContext, defineReflex, pass } from "@agentreflex/core";

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

function storeDir(cwd: string): string {
  const key = crypto.createHash("sha256").update(cwd).digest("hex").slice(0, 12);
  return path.join(os.homedir(), ".agentreflex", "recover", key);
}

function snapshot(file: string, cwd: string): void {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
  const dir = storeDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(file, path.join(dir, `${Date.now()}-${path.basename(file)}`));
}

export default defineReflex({
  name: "recover",
  onToolCall(ctx: ToolCallContext) {
    if (EDIT_TOOLS.has(ctx.tool)) {
      for (const p of ctx.paths) snapshot(path.resolve(ctx.cwd, p), ctx.cwd);
    }
    return pass();
  },
});
