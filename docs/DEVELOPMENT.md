# Development Guide

Local setup, conventions, scripts, and CI for CrewChat contributors.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | See `.nvmrc` |
| pnpm | 10+ | `corepack enable && corepack prepare pnpm@10.27.0 --activate` |
| Docker | optional | For local MongoDB and Redis |

## Initial setup

```bash
git clone <repo-url> crewchat && cd crewchat
pnpm install
```

### Start data stores

```bash
docker compose up -d
```

Starts MongoDB on `27017` and Redis on `6379` with health checks and persistent volumes.

### Configure environment

```bash
cp apps/web/.env.local.sample apps/web/.env.local
cp apps/socket/.env.sample apps/socket/.env
```

Generate secrets:

```bash
openssl rand -base64 32
```

Both apps must share `AUTH_SECRET`, `SOCKET_JWT_SECRET`, `MONGODB_URI`, and `REDIS_URL`. See [Authentication](./AUTH.md) for details.

### Build shared packages

Domain packages must be built before running apps:

```bash
pnpm build:db && pnpm build:chat && pnpm build:message && pnpm build:user
```

Or build everything:

```bash
pnpm build
```

### Run development servers

```bash
pnpm dev:web     # terminal 1 — http://localhost:3000
pnpm dev:socket  # terminal 2 — http://localhost:3001
```

### Seed demo data (optional)

```bash
cd apps/web && pnpm seed
```

Loads users, chats, and messages from `scripts/seed/data/*.json`.

## Monorepo structure

Managed by pnpm workspaces (`pnpm-workspace.yaml`):

```
packages:
  - apps/*
  - packages/*
```

### Package naming

| Directory | NPM name |
|-----------|----------|
| `apps/web` | `@crewchat/web` |
| `apps/socket` | `@crewchat/socket` |
| `packages/db` | `@crewchat/db` |
| `packages/chat` | `@crewchat/chat` |
| `packages/message` | `@crewchat/message` |
| `packages/user` | `@crewchat/user` |

### Build dependencies

```
@crewchat/db  →  @crewchat/chat, @crewchat/message, @crewchat/user
all packages  →  apps/web, apps/socket
```

Filter builds with pnpm:

```bash
pnpm --filter @crewchat/web... build    # web + dependencies
pnpm --filter @crewchat/socket... build # socket + dependencies
```

## Scripts reference

### Root (`package.json`)

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Next.js dev server |
| `pnpm dev:socket` | Socket server with hot reload |
| `pnpm build` | Build all workspace packages and apps |
| `pnpm build:web` | Build web + dependencies |
| `pnpm build:socket` | Build socket + dependencies |
| `pnpm build:db` | Build db package only |
| `pnpm build:chat` | Build chat package only |
| `pnpm build:message` | Build message package only |
| `pnpm build:user` | Build user package only |
| `pnpm start:web` | Production Next.js (`next start`) |
| `pnpm start:socket` | Production socket (`node dist/index.js`) |
| `pnpm typecheck` | TypeScript check (all packages with script) |
| `pnpm lint` | ESLint (web app) |
| `pnpm clean` | Remove build artifacts |
| `pnpm reset` | Clean + reinstall |

## Code conventions

### Where logic belongs

| Layer | Responsibility | Example |
|-------|----------------|---------|
| `packages/*` | Domain logic, DB access, validation | `sendMessage`, `getChats` |
| `apps/web/lib/actions/` | Auth check, connect DB, call packages, Redis publish | `sendMessageAction` |
| `apps/web/components/` | UI, local state, store updates | `ChatWindow` |
| `apps/web/store/` | Client-side normalized state | `useChatStore` |
| `apps/socket/handlers/` | Event validation, relay, Redis/call state | `call.handler.ts` |

**Rule:** Keep server actions and socket handlers thin — delegate to workspace packages.

### TypeScript

- Strict mode enabled via `tsconfig.base.json`
- Avoid `any` where practical
- DTOs in `apps/web/lib/types/` mirror package return types

### Adding a new feature checklist

1. **Domain logic** → add function in appropriate `packages/*` module
2. **Export** → add to package `index.ts`
3. **Server action** → wrap in `apps/web/lib/actions/` with auth + `connectToDB`
4. **Realtime** (if needed) → publish to Redis in action; handle in socket server
5. **UI** → component + Zustand store updates
6. **Build** → `pnpm build:<package>` then test

### Git commits

Use clear, imperative messages:

```
fix: reconnect socket after token expiry
feat: add message reactions
refactor: extract chat order computation
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Runs on push/PR to `main` / `master`:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm lint`
4. `pnpm build`

CI sets placeholder env vars (no real DB needed for build). Mirror these steps locally before opening a PR:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Troubleshooting

### "Cannot find module @crewchat/db"

Build packages first:

```bash
pnpm build:db
```

### Socket connection fails

1. Check `NEXT_PUBLIC_SOCKET_URL` matches socket server port
2. Verify `SOCKET_JWT_SECRET` is identical in web and socket env files
3. Check `CLIENT_ORIGIN` matches `AUTH_URL`
4. Ensure socket server is running (`pnpm dev:socket`)

### MongoDB connection errors

1. Confirm `docker compose up -d` and containers are healthy
2. `MONGODB_URI` should be `mongodb://localhost:27017/crewchat` for local dev

### NextAuth errors

1. `AUTH_SECRET` must be set (32+ characters)
2. `AUTH_URL` must match the URL you access the app from
3. Google OAuth requires valid `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### Hot reload issues with packages

After changing `packages/*` source, rebuild the affected package:

```bash
pnpm build:chat  # example
```

Or use `pnpm dev:web` which may pick up changes depending on transpilation config.

## Related docs

- [Architecture](./ARCHITECTURE.md) — system design
- [Packages](./PACKAGES.md) — domain API reference
- [Deployment](./DEPLOYMENT.md) — production setup
- [CONTRIBUTING.md](../CONTRIBUTING.md) — PR guidelines
