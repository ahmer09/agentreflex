# no-rm-rf 🧨

**Stop the catastrophic delete.**

Blocks a recursive `rm` whose target is dangerous — `/`, `~`, `$HOME`, a system directory,
or a bare `*`. Ordinary cleanups like `rm -rf node_modules` pass straight through.

```bash
npx agentreflex add no-rm-rf
```

Shell-aware, so `sudo rm -fr /usr/local` is caught too.
