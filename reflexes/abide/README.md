# abide ⚖️

**A working agreement your AI agent actually keeps.**

abide is a reflex. Declare your human↔agent rules once — no force-push, ask before
pushing, stay inside the repo — and abide returns `deny` / `ask` before the agent
runs the command, on every agent agentreflex supports.

```bash
npx agentreflex add abide
```

Rules live in `.reflex/abide.yaml` (sensible defaults ship built in):

```yaml
rules:
  - description: Never force-push.
    action: deny
    command: ["git push*--force*"]
  - description: Ask before pushing.
    action: ask
    command: ["git push*"]
  - description: Don't edit files outside the project.
    action: deny
    tool: [Edit, Write, MultiEdit]
    pathOutsideProject: true
```

Commands are matched shell-aware, so `cd src && git push --force` is caught too —
not waved through by a naive substring check.
