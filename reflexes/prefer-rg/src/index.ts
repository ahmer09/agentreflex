import { type Decision, defineReflex, deny, parseCommand, pass } from "@agentreflex/core";

function isRecursiveGrep(argv: string[]): boolean {
  const cmd = argv[0];
  if (cmd === undefined || !["grep", "egrep", "fgrep"].includes(cmd)) return false;
  return argv
    .slice(1)
    .some(
      (t) => t === "--recursive" || (t.startsWith("-") && !t.startsWith("--") && /[rR]/.test(t)),
    );
}

export default defineReflex({
  name: "prefer-rg",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    for (const c of parseCommand(ctx.command)) {
      if (isRecursiveGrep(c.argv))
        return deny(
          "Use ripgrep (rg) instead of recursive grep — faster, and it respects .gitignore.",
        );
    }
    return pass();
  },
});
