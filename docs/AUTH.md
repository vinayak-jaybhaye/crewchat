# Authentication

CrewChat uses two separate auth layers: **NextAuth** for the web app session and a **short-lived JWT** for the Socket.IO connection.

## Overview

```mermaid
flowchart TB
    subgraph web [Web App]
        Login[Login Page]
        NextAuth[NextAuth v5]
        Session[JWT Session]
        SocketToken[/api/socket-token]
    end

    subgraph socket [Socket Server]
        JWTAuth[authMiddlewareJWT]
        SocketData[socket.data.userId]
    end

    Login --> NextAuth
    NextAuth --> Session
    Session --> SocketToken
    SocketToken -->|15-min JWT| JWTAuth
    JWTAuth --> SocketData
```

## Web session (NextAuth v5)

**Config:** `apps/web/auth.ts`

### Providers

| Provider | Flow |
|----------|------|
| Google OAuth | Upsert user on first sign-in; `generateUniqueUsername` for new accounts |
| Credentials | Email + password via bcrypt; requires `passwordAuthenticationEnabled` |

### Session strategy

JWT-based (not database sessions). The JWT and session carry:

| Field | Description |
|-------|-------------|
| `mongoId` | MongoDB user `_id` |
| `username` | Display name |
| `avatarUrl` | Profile image URL |

Type augmentation: `apps/web/types/next.auth.d.ts`

### Google sign-in flow

1. User clicks Google login → OAuth redirect
2. `signIn` callback: find or create `User` in MongoDB
3. New users get auto-generated username from email prefix
4. `jwt` callback copies `mongoId`, `username`, `avatarUrl` to token
5. `session` callback exposes fields to client

### Credentials sign-in flow

1. User submits email/password
2. `authorize`: find user, check `passwordAuthenticationEnabled`, verify bcrypt hash
3. Update `lastActive`
4. Return user object with `mongoId`

### Password setup

Users who signed in via Google can enable password auth in Settings:
- `enablePasswordAuthentication` server action hashes password with bcrypt
- Blocks `example.com` emails (seed users)
- Sets `passwordAuthenticationEnabled: true`

### Required environment variables

```
AUTH_SECRET          # NextAuth signing secret (32+ chars)
AUTH_URL             # Public web URL (e.g. http://localhost:3000)
GOOGLE_CLIENT_ID     # Google OAuth
GOOGLE_CLIENT_SECRET # Google OAuth
```

`AUTH_SECRET` must match between web and socket apps.

## Socket authentication

### JWT mode (default)

Used when web and socket run on different origins (typical production setup).

**Token issuance** — `apps/web/app/api/socket-token/route.ts`:

```typescript
// Requires authenticated session
const token = jwt.sign(
  { mongoId: session.user.mongoId },
  process.env.SOCKET_JWT_SECRET!,
  { expiresIn: "15m" }
);
```

**Token verification** — `apps/socket/src/middleware/auth.middleware.ts`:

```typescript
const payload = jwt.verify(token, SOCKET_JWT_SECRET) as { mongoId: string };
socket.data.userId = payload.mongoId;
```

**Client usage** — `apps/web/lib/socket.ts`:

```typescript
io(SOCKET_URL, {
  auth: { token },
  autoConnect: false,
});
```

Connection flow in `SocketProvider.tsx`:
1. Wait for `status === "authenticated"`
2. Fetch `/api/socket-token`
3. Pass token to `getSocket(token)` and connect

### Cookie mode (alternate)

`authMiddlewareCookie` reads the NextAuth JWT from `socket.handshake.headers.cookie` using `getToken()` from `next-auth/jwt`.

Use when web and socket share a domain (same-site cookies). Switch in `apps/socket/src/index.ts`:

```typescript
io.use(authMiddlewareCookie);
```

### Required environment variables

```
SOCKET_JWT_SECRET  # Socket token signing (32+ chars, shared with web)
AUTH_SECRET        # Required by socket startup (for cookie mode)
CLIENT_ORIGIN      # Must match web AUTH_URL for CORS
```

## Authorization in server actions

All server actions follow this pattern:

```typescript
"use server";

export async function someAction() {
  const session = await auth();
  if (!session?.user?.mongoId) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.mongoId;
  // ...
}
```

Domain packages enforce additional rules (membership, admin role, sender-only edits).

## Authorization in socket handlers

- **Connection:** `authMiddlewareJWT` rejects invalid tokens
- **Post-connect:** `connection.handler.ts` disconnects if `socket.data.userId` is falsy
- **WebRTC:** room membership in `call:{callId}` is the authorization gate
- **Calls:** caller/callee checks in `call.handler.ts`

## Security notes

| Topic | Recommendation |
|-------|----------------|
| Secret rotation | Rotate `AUTH_SECRET` and `SOCKET_JWT_SECRET` on compromise; users must re-login |
| Token expiry | Socket tokens expire after 15 minutes; clients refresh via `/api/socket-token` |
| OAuth redirects | Keep Google redirect URIs aligned with `AUTH_URL` |
| Password hashing | bcrypt via `bcryptjs` in server actions only |
| CORS | `CLIENT_ORIGIN` must exactly match the web app origin |

## Session data access

**Server components / actions:**

```typescript
import { auth } from "@/auth";
const session = await auth();
```

**Client components:**

```typescript
import { useSession } from "next-auth/react";
const { data: session, status } = useSession();
```

**Root layout** fetches session server-side and passes to `AuthProvider`.
