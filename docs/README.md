# CrewChat Documentation

Developer documentation for the CrewChat monorepo — a real-time team chat application with direct messages, group chats, voice/video calls, and Google OAuth.

## Quick links

| Document | What you'll learn |
|----------|-------------------|
| [Architecture](./ARCHITECTURE.md) | System design, component boundaries, and request flows |
| [Data model](./DATA_MODEL.md) | MongoDB schemas, relationships, and indexing |
| [Packages](./PACKAGES.md) | Shared domain logic (`@crewchat/db`, `chat`, `message`, `user`) |
| [Web app](./WEB_APP.md) | Next.js UI, server actions, stores, and components |
| [Socket server](./SOCKET_SERVER.md) | Socket.IO gateway, events, calls, and WebRTC relay |
| [Realtime](./REALTIME.md) | Message delivery, Redis pub/sub, and socket event catalog |
| [Authentication](./AUTH.md) | NextAuth, session JWT, and socket token flow |
| [Development](./DEVELOPMENT.md) | Local setup, conventions, seeding, and CI |
| [Deployment](./DEPLOYMENT.md) | Production topology, env vars, and health checks |

## Repository layout

```
crewchat/
├── apps/
│   ├── web/              # Next.js 16 — UI, server actions, NextAuth
│   └── socket/           # Express + Socket.IO — realtime gateway
├── packages/
│   ├── db/               # Mongoose models and connection
│   ├── chat/             # Chat CRUD, membership, preferences
│   ├── message/          # Send, edit, delete, paginate messages
│   └── user/             # User accounts and profile
├── docs/                 # This documentation
├── docker-compose.yml    # Local MongoDB + Redis
└── pnpm-workspace.yaml   # Monorepo workspace config
```

## Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zustand |
| Auth | NextAuth v5 (JWT sessions), Google OAuth, credentials |
| Realtime | Socket.IO, Redis pub/sub |
| Calls | WebRTC (STUN), Socket.IO signaling |
| Data | MongoDB (source of truth), Redis (coordination) |
| Tooling | pnpm workspaces, TypeScript 5.9, ESLint |

## Core design principle

**Business logic lives in `packages/*`.** Apps are thin orchestration layers:

- `apps/web` — server actions call packages; React components manage UI state
- `apps/socket` — event handlers validate access and relay signals; persistence for messages happens in the web app

This keeps the database shape, domain rules, and UI decoupled and testable.

## Where to start

1. **New to the project?** Read [Architecture](./ARCHITECTURE.md) then [Development](./DEVELOPMENT.md) to get running locally.
2. **Adding a chat feature?** Start with [Packages](./PACKAGES.md) and [Realtime](./REALTIME.md).
3. **Working on calls?** See [Socket server](./SOCKET_SERVER.md) (signaling) and [Web app](./WEB_APP.md) (UI + `useWebRTC`).
4. **Deploying?** See [Deployment](./DEPLOYMENT.md).
