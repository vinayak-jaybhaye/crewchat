# CrewChat

Real-time team chat built as a **pnpm monorepo**: a Next.js web app, a Socket.IO server, and shared domain packages over MongoDB and Redis.

## Features

- Direct messages and group chats
- Real-time messaging, edits, and deletes (WebSockets + Redis pub/sub)
- Voice/video calls (WebRTC signaling via Socket.IO)
- Google OAuth and email/password (NextAuth v5)
- Pin, mute, unread state, and member management

## Prerequisites

- **Node.js** 20+ ([`.nvmrc`](./.nvmrc))
- **pnpm** 10+ (`corepack enable && corepack prepare pnpm@10.27.0 --activate`)
- **Docker** (optional, for local MongoDB and Redis)

## Quick start

### 1. Clone and install

```bash
git clone <repo-url> crewchat && cd crewchat
pnpm install
```

### 2. Start data stores

```bash
docker compose up -d
```

This starts MongoDB on `27017` and Redis on `6379`.

### 3. Configure environment

```bash
cp apps/web/.env.local.sample apps/web/.env.local
cp apps/socket/.env.sample apps/socket/.env
```

Edit both files. Required values:

| Variable | App | Description |
|----------|-----|-------------|
| `MONGODB_URI` | web, socket | MongoDB connection string |
| `REDIS_URL` | web, socket | Redis connection string |
| `AUTH_SECRET` | web, socket | NextAuth secret (32+ random chars) |
| `SOCKET_JWT_SECRET` | web, socket | Short-lived socket token signing secret |
| `AUTH_URL` | web | Public URL of the web app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SOCKET_URL` | web | Public URL of the socket server |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | web | Google OAuth (optional if using credentials only) |
| `CLIENT_ORIGIN` | socket | Web app origin for CORS (must match `AUTH_URL`) |
| `PORT` | socket | Socket server port (default `3001`) |

Generate secrets:

```bash
openssl rand -base64 32
```

### 4. Build shared packages and run

```bash
pnpm build:db && pnpm build:chat && pnpm build:message && pnpm build:user
pnpm dev:web    # terminal 1 — http://localhost:3000
pnpm dev:socket # terminal 2 — http://localhost:3001
```

Or build everything once:

```bash
pnpm build
pnpm start:web    # after `pnpm build:web`
pnpm start:socket # after `pnpm build:socket`
```

### 5. Seed demo users (optional)

```bash
cd apps/web && pnpm seed
```

## Project layout

```
crewchat/
├── apps/
│   ├── web/          # Next.js 16 UI + server actions + NextAuth
│   └── socket/       # Express + Socket.IO realtime gateway
├── packages/
│   ├── db/           # Mongoose schemas and DB connection
│   ├── chat/         # Chat domain logic
│   ├── message/      # Message domain logic
│   └── user/         # User domain logic
├── docker-compose.yml
└── docs/             # Architecture and deployment guides
```

## Documentation

Full developer documentation is in [`docs/`](./docs/README.md):

| Guide | Description |
|-------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design and request flows |
| [Data model](./docs/DATA_MODEL.md) | MongoDB schemas and relationships |
| [Packages](./docs/PACKAGES.md) | Domain logic API reference |
| [Web app](./docs/WEB_APP.md) | Next.js routes, actions, stores, components |
| [Socket server](./docs/SOCKET_SERVER.md) | Realtime gateway, calls, WebRTC |
| [Realtime](./docs/REALTIME.md) | Event catalog and pub/sub flows |
| [Authentication](./docs/AUTH.md) | NextAuth and socket token auth |
| [Development](./docs/DEVELOPMENT.md) | Local setup, conventions, CI |
| [Deployment](./docs/DEPLOYMENT.md) | Production deployment |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Next.js dev server |
| `pnpm dev:socket` | Socket server with hot reload |
| `pnpm build` | Build all workspace packages and apps |
| `pnpm typecheck` | TypeScript check (packages with `typecheck` script) |
| `pnpm lint` | ESLint (web app) |
| `pnpm clean` | Remove build artifacts |

## Production checklist

- Set strong `AUTH_SECRET` and `SOCKET_JWT_SECRET`; never commit `.env` files
- Run web and socket behind HTTPS; set `AUTH_URL`, `CLIENT_ORIGIN`, and `NEXT_PUBLIC_SOCKET_URL` to production URLs
- Use managed MongoDB and Redis (or self-hosted with persistence and backups)
- Scale socket horizontally: Redis pub/sub is already used for cross-instance events
- See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment patterns and health checks

## Health checks

- Socket server: `GET /health` on the socket port
- Web: standard Next.js process health via your platform (Vercel, etc.)
