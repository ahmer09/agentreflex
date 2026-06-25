import { type Decision, ask, commandMatches, defineReflex, pass } from "@agentreflex/core";

const PROD = [
  "*deploy*", // vercel/netlify/fly/firebase/serverless deploy
  "*--prod*",
  "terraform apply*",
  "kubectl*apply*",
  "npm publish*",
  "pnpm publish*",
  "yarn publish*",
  "gh release create*",
];

export default defineReflex({
  name: "ask-on-prod",
  onToolCall(ctx): Decision {
    if (ctx.tool !== "Bash" || !ctx.command) return pass();
    if (commandMatches(ctx.command, PROD))
      return ask("This looks like it touches production — confirm before it runs.");
    return pass();
  },
});
