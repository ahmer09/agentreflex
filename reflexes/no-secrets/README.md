# no-secrets 🔑

**Keep agents out of your secrets.**

Blocks reading or writing `.env` files, private keys (`*.pem`, `id_rsa`, …), and credential
files (`.npmrc`, `.aws/credentials`, …) — whether via the edit tools or a shell command
like `cat .env`.

```bash
npx agentreflex add no-secrets
```
