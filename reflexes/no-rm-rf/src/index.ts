import { type Decision, defineReflex, deny, parseCommand, pass } from "@agentreflex/core";

const DANGER = new Set(["/", "/*", "~", "~/", "$HOME", "${HOME}", ".", "./", "..", "../", "*"]);
const SYSTEM = /^\/(usr|etc|bin|sbin|var|lib|opt|boot|sys|dev|root|home)(\/|$)/;

function isDangerTarget(t: string): boolean {
  if (DANGER.has(t)) return true;
  if (t === "~" || t.startsWith("~/")) return true;
  return SYSTEM.test(t);
}

/** Targets of a recursive `rm`, or null when the command isn't a recursive rm. */
function recursiveRmTargets(raw: string[]): string[] | null {
  const argv = raw[0] === "sudo" ? raw.slice(1) : raw;
  if (argv[0] !== "rm") return null;
  let recursive = false;
  const targets: string[] = [];
  for (const t of argv.slice(1)) {
    if (t === "--recursive") recursive = true;
    else if (t.startsWith("--"))
      continue; // --force, --, --no-preserve-root, …
    else if (t.startsWith("-")) {
      if (/r/i.test(t)) recursive = true;
    } else targets.push(t);
  }
  return recursive ? targets : null;
}

export default defineReflex({
  name: "no-rm-rf",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    for (const c of parseCommand(ctx.command)) {
      const targets = recursiveRmTargets(c.argv);
      if (targets?.some(isDangerTarget))
        return deny("Refusing a recursive delete of a dangerous path (root, home, system, or *).");
    }
    return pass();
  },
});
