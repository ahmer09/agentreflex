# ask-on-prod 🚀

**Pause before anything touches production.**

Returns `ask` before deploy and publish commands — `*deploy*`, `*--prod*`, `terraform apply`,
`kubectl … apply`, `npm publish`, `gh release create` — so a human confirms first.

```bash
npx agentreflex add ask-on-prod
```

> `ask` is honored on Claude Code, Cursor, and Copilot CLI. On agents without an `ask`
> hook the call is allowed through — pair with a `deny` reflex where it must hard-stop.
