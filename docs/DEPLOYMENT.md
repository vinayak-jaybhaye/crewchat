# Deployment

## Environment separation

Maintain separate env files or secrets per environment (development, staging, production). The web app and socket server must share:

- `AUTH_SECRET`
- `SOCKET_JWT_SECRET`
- `MONGODB_URI`
- `REDIS_URL`
- `MONGODB_MAX_POOL_SIZE` (optional, default 10)
- `MONGODB_MIN_POOL_SIZE` (optional, default 2)

The socket server additionally needs `CLIENT_ORIGIN` matching the web app’s public URL (scheme + host, no trailing slash).

## Web app (`apps/web`)

Typical targets: **Vercel**, **Railway**, **Fly.io**, or any Node host running `next start`.

1. Set all variables from `.env.local.sample`.
2. `pnpm build:web` (or root `pnpm build` from CI).
3. Start with `pnpm start:web` or platform default (`next start`).

`AUTH_URL` must be the canonical public URL (required for NextAuth callbacks).

### Health check

Configure your load balancer or orchestrator to probe:

```
GET /api/health
```

Expect `200` with JSON status representing active connection states of both Redis and MongoDB.

## Socket server (`apps/socket`)

Deploy as a long-running Node process (Railway, Fly.io, Render, ECS, Kubernetes, etc.).

### Render

Deploy from the **repository root**, not `apps/socket`. pnpm workspaces require the full monorepo at runtime so `@crewchat/db` and its dependencies resolve correctly.

| Setting | Value |
|---------|-------|
| Root Directory | `.` (repo root) |
| Build Command | `pnpm install --frozen-lockfile && pnpm build:socket` |
| Start Command | `pnpm start:socket` |
| Health Check Path | `/health` |

A `render.yaml` blueprint is included at the repo root. If you previously set Root Directory to `apps/socket`, change it to the repo root and use the commands above.

`PORT` is set automatically by Render — the socket server reads `process.env.PORT`.

Optional container image (from repo root):

```bash
docker build -f apps/socket/Dockerfile -t crewchat-socket .
docker run --env-file apps/socket/.env -p 3001:3001 crewchat-socket
```

1. Build: `pnpm build:socket` → runs `tsc`, output in `apps/socket/dist/`.
2. Start: `node dist/index.js` (or `pnpm start:socket`).
3. Expose the port configured in `PORT` (default `3001`).
4. Point `NEXT_PUBLIC_SOCKET_URL` on the web app to this public URL (use `wss://` in production if terminating TLS at the load balancer).

### Health check

Configure your load balancer or orchestrator to probe:

```
GET /health
```

Expect `200` with JSON `{ "status": "ok", ... }`.

### Graceful shutdown

The socket process handles `SIGTERM` and `SIGINT`: closes HTTP, disconnects Redis, and closes the MongoDB connection before exit. Set a stop grace period of at least 10–30s on your platform.

## MongoDB

- Use a replica set in production (Atlas, DocumentDB, or self-managed).
- Enable backups and network restrictions (IP allowlist or VPC peering).
- Index frequently queried fields (usernames, chat membership) as your data grows.

## Redis

- Use a managed Redis with persistence if you rely on connection state across restarts.
- For multiple socket replicas, all instances must share the same `REDIS_URL`.

## Docker (data layer only)

The repo’s `docker-compose.yml` is intended for **local development** (MongoDB + Redis). Do not expose MongoDB/Redis ports publicly in production without authentication and firewall rules.

Example production topology:

```
[Browser] → HTTPS → [CDN / Next.js]
                 → WSS → [Socket.IO × N] → Redis
                              ↓
                          MongoDB
```

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs install, typecheck, lint, and build on push/PR. Mirror those steps in your deploy pipeline before promoting artifacts.

## Security notes

- Rotate `AUTH_SECRET` and `SOCKET_JWT_SECRET` on compromise; users will need to re-login.
- Socket tokens expire after 15 minutes; clients should refresh via `/api/socket-token` before reconnecting.
- Keep Google OAuth redirect URIs aligned with `AUTH_URL`.
