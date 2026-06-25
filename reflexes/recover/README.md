# recover 🛟

**An undo button for everything your AI agent touches.**

recover is a reflex. Before the agent edits a file, it snapshots the current
contents — so any change is reversible. It never blocks; it just makes the agent's
work safe to undo.

```bash
npx agentreflex add recover
```

Snapshots live under `~/.agentreflex/recover`, keyed by project.
