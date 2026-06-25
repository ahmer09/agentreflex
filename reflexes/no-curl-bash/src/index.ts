import { type Decision, commandMatches, defineReflex, deny, pass } from "@agentreflex/core";

const PIPE_TO_SHELL = [
  "curl*|*sh*",
  "curl*|*bash*",
  "curl*|*zsh*",
  "wget*|*sh*",
  "wget*|*bash*",
  "wget*|*zsh*",
  "*$(curl*",
  "*$(wget*",
  "*<(curl*",
  "*<(wget*",
];

export default defineReflex({
  name: "no-curl-bash",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    if (commandMatches(ctx.command, PIPE_TO_SHELL))
      return deny("Piping a remote script straight into a shell — download and read it first.");
    return pass();
  },
});
