# agentreflex

See **@AGENTS.md** for the full guide to working in this repo.

**The one rule that trips people up:** to test a reflex, don't wire it into a live
agent and restart the session. Run it in isolation from source:

```bash
pnpm reflex:dev <name> --tool Read --paths .env   # or: pnpm reflex:dev <name> "git push --force"
pnpm reflex:check [name]                           # validate before a PR
```
