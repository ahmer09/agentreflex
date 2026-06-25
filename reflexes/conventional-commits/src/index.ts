import { type Decision, defineReflex, deny, parseCommand, pass } from "@agentreflex/core";

const TYPES = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert";
const CONVENTIONAL = new RegExp(`^(${TYPES})(\\([^)]+\\))?!?: .+`);

/** The inline -m message of a `git commit`, or null when there isn't one. */
function commitMessage(argv: string[]): string | null {
  if (argv[0] !== "git" || argv[1] !== "commit") return null;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === undefined) continue;
    if (a === "-m" || a === "--message") return argv[i + 1] ?? "";
    if (a.startsWith("-m")) return a.slice(2);
    if (a.startsWith("--message=")) return a.slice("--message=".length);
  }
  return null;
}

export default defineReflex({
  name: "conventional-commits",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    for (const c of parseCommand(ctx.command)) {
      const msg = commitMessage(c.argv);
      if (msg !== null && !CONVENTIONAL.test(msg))
        return deny('Use Conventional Commits, e.g. "feat: add login" or "fix(api): handle null".');
    }
    return pass();
  },
});
