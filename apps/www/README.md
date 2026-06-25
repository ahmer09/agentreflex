# @agentreflex/www

Marketing site for **agentreflex** — _Give your AI agents reflexes._

> MCP gives your agent hands. agentreflex gives it reflexes.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first `@theme` config, no `tailwind.config.js`)
- [shadcn/ui](https://ui.shadcn.com) — New York style, CSS variables
- [Geist](https://vercel.com/font) Sans + Mono via `next/font`

## Develop

This package lives in the agentreflex pnpm monorepo. From the repo root:

```bash
pnpm install
pnpm --filter @agentreflex/www dev
```

Then open http://localhost:3000.

## Scripts

| Script  | Description              |
| ------- | ------------------------ |
| `dev`   | Start the dev server     |
| `build` | Production build         |
| `start` | Serve the built site     |
| `lint`  | Lint with `next lint`    |

## Theme tokens

Defined as `@theme` custom properties in `app/globals.css`:

| Token        | Value     |
| ------------ | --------- |
| background   | `#0A0A0B` |
| surface      | `#141417` |
| foreground   | `#EDEDEF` |
| muted        | `#86868f` |
| border       | `#26262b` |
| signal lime  | `#B8FF2E` |
| cyan         | `#35E6FF` |
