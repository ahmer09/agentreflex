import { type Decision, defineReflex, deny, parseCommand, pass } from "@agentreflex/core";

const READ_WRITE = new Set(["Read", "Write", "Edit", "MultiEdit"]);

const SECRET = [
  /(^|\/)\.env(\.[^/]+)?$/i, // .env, .env.local, .env.production
  /\.(pem|key|p12|pfx)$/i,
  /(^|\/)id_(rsa|ed25519|ecdsa|dsa)$/i,
  /(^|\/)\.(npmrc|netrc|pgpass)$/i,
  /(^|\/)\.aws\/credentials$/i,
  /(^|\/)secrets?\.(json|ya?ml|toml|env)$/i,
];
const isSecret = (p: string) => SECRET.some((re) => re.test(p));
const REASON = "That's a secrets file — agentreflex won't let an agent read or write it.";

export default defineReflex({
  name: "no-secrets",
  onToolCall(ctx): Decision {
    if (ctx.tool === "Bash" && ctx.command) {
      for (const c of parseCommand(ctx.command)) {
        if (c.argv.some(isSecret)) return deny(REASON);
      }
      return pass();
    }
    if (READ_WRITE.has(ctx.tool) && ctx.paths.some(isSecret)) return deny(REASON);
    return pass();
  },
});
