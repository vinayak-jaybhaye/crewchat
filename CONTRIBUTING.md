# Contributing

## Development setup

1. Follow [README.md](./README.md) to install dependencies and start MongoDB/Redis.
2. Copy env samples into `apps/web/.env.local` and `apps/socket/.env`.
3. Run `pnpm dev:web` and `pnpm dev:socket` in separate terminals.

## Before opening a PR

```bash
pnpm typecheck
pnpm lint
pnpm build
```

CI runs the same checks on GitHub Actions.

## Code conventions

- Put shared domain logic in `packages/*`, not in React components or socket handlers.
- Match existing TypeScript strictness; avoid `any` where practical.
- Keep server actions and socket handlers thin — delegate to workspace packages.

## Commits

Use clear, imperative commit messages (e.g. `fix: reconnect socket after token expiry`).
