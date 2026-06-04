# Architecture

## Overview

CrewChat is a monorepo with two runnable apps and four shared domain packages. Business logic lives in `packages/*`; apps are thin orchestration layers (HTTP/server actions and WebSocket handlers).

## Components

### `apps/web`

- **Next.js 16** App Router, React 19, Tailwind CSS v4
- **NextAuth v5** for Google OAuth and credentials
- **Server actions** call `@crewchat/chat`, `@crewchat/message`, and `@crewchat/user`
- **Zustand** for client state; **Socket.IO client** for realtime updates
- Issues short-lived JWTs via `/api/socket-token` for socket authentication

### `apps/socket`

- **Express** HTTP server with **Socket.IO**
- **`authMiddlewareJWT`**: verifies socket token from handshake `auth.token`
- **Redis**: connection tracking and pub/sub for multi-instance broadcast
- Handlers under `src/handlers/` (connection, chat events, calls, WebRTC, Redis bridge)

### `packages/db`

Mongoose models: `User`, `Chat`, `Message`, `UserChatMetaData`. Exports `connectToDB()` with a global connection cache (safe for Next.js hot reload).

### `packages/chat` / `message` / `user`

Pure domain functions used by both web server actions and socket handlers. Keeps DB shape and UI decoupled.

## Request flows

### Sign-in

1. User authenticates via NextAuth (`apps/web/auth.ts`).
2. User document is created or updated in MongoDB.
3. Session JWT carries `mongoId`, `username`, `avatarUrl`.

### Realtime connection

1. Client fetches `/api/socket-token` (requires session).
2. Client connects to socket with `auth: { token }`.
3. Socket verifies JWT with `SOCKET_JWT_SECRET`, sets `socket.data.userId`.
4. Redis records the connection; pub/sub relays chat/message/call events to the right sockets.

### Send message

1. Client emits a socket event (or uses a server action for persistence-first flows, depending on feature).
2. Socket handler validates access, calls `packages/message` to write MongoDB.
3. Handler publishes to Redis; subscribers emit `message:new` to room members.

## Data stores

| Store | Role |
|-------|------|
| **MongoDB** | Source of truth: users, chats, messages, per-user chat metadata |
| **Redis** | Ephemeral/socket coordination and pub/sub between socket instances |

## Auth modes

The codebase supports two socket auth strategies (see comments in `auth.middleware.ts`):

- **JWT** (default): separate socket host; token from `/api/socket-token`. Use when web and socket are on different origins.
- **Cookie / NextAuth JWT**: enable `authMiddlewareCookie` when socket and web share a domain.

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment
- [../apps/web/.env.local.sample](../apps/web/.env.local.sample) — web environment template
- [../apps/socket/.env.sample](../apps/socket/.env.sample) — socket environment template
