# agentreflex docs

Documentation site for [agentreflex](https://agentreflex.dev), built with [Mintlify](https://mintlify.com). Deploys to **docs.agentreflex.dev**.

## Local development

From this package (`apps/docs`):

```bash
# install the Mintlify CLI once
npm i -g mint

# start the local dev server (reads docs.json)
mintlify dev
```

The site is served at `http://localhost:3000`. Edits to `.mdx` files and `docs.json` hot-reload.

## Structure

```
apps/docs/
  docs.json            # Mintlify config (navigation, theme, navbar)
  introduction.mdx
  quickstart.mdx
  concepts/            # reflexes, events, decisions, capability-matrix, trust-model
  guides/              # writing-a-reflex, distribution
  reference/           # cli, spec
  contributing.mdx
  logo/                # logo + favicon assets (placeholders)
```

## Deployment

Pushes to the default branch deploy automatically to **docs.agentreflex.dev** via the Mintlify GitHub integration. No manual build step is required.
