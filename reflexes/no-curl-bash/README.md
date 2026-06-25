# no-curl-bash 📡

**Don't pipe the internet into a shell.**

Blocks the classic supply-chain footgun — `curl … | bash`, `wget … | sh`, and the
`bash -c "$(curl …)"` form. Download it, read it, then run it.

```bash
npx agentreflex add no-curl-bash
```

Plain downloads (`curl -O …`) are left alone.
