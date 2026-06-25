import { type Decision, defineReflex, deny, parseCommand, pass } from "@agentreflex/core";

/** "force" only when --force/-f is a real push flag — never a branch named *-f*. */
function pushForce(command: string): "force" | "safe" | "none" {
  for (const c of parseCommand(command)) {
    const argv = c.argv[0] === "sudo" ? c.argv.slice(1) : c.argv;
    if (argv[0] !== "git" || argv[1] !== "push") continue;
    const flags = argv.slice(2);
    if (flags.some((t) => t === "--force-with-lease" || t.startsWith("--force-with-lease=")))
      return "safe";
    if (flags.some((t) => t === "--force" || t === "-f")) return "force";
  }
  return "none";
}

export default defineReflex({
  name: "no-force-push",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    if (pushForce(ctx.command) === "force")
      return deny("Force-push rewrites shared history — use --force-with-lease, or open a PR.");
    return pass();
  },
});
