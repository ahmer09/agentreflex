# no-force-push 🚫

**Never force-push to a shared branch.**

Blocks `git push --force` (and `-f`) before it runs, on every agent. `--force-with-lease`
— the safe variant — is allowed through.

```bash
npx agentreflex add no-force-push
```

Commands are matched shell-aware, so `cd repo && git push -f` is caught too — and a
branch named `feature-fix` won't trip it.
