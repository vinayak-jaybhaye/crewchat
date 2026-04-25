# CrewChat Project Documentation

## 1. Overview
CrewChat is a monorepo workspace providing a complete, real-time chat application architecture. It makes use of `pnpm` workspaces to separate modular frontend clients, background socket servers, and shared core domain logic into distinct internal packages.

## 2. Repository Structure
The monorepo separates its logic into two top-level directories: `apps/` and `packages/`.

### 2.1 `apps/` (Executable Environments)
- **`web`**: The user-facing application built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. It manages authentication flows (`(auth)` directory) and the main application layout (`(app)` directory).
- **`socket`**: A real-time Node.js server powered by Express and Socket.IO. It operates on WebSockets to ingest, broadcast, and interact with the clients in real time, securely relying on JWT/cookie middleware.

### 2.2 `packages/` (Shared Domain Code)
- **`db`**: Contains the physical data layer schemas mapping to MongoDB via `Mongoose` (`ChatModel`, `MessageModel`, `UserModel`, `UserChatMetaDataModel`).
- **`chat`**: Implements business logic related to chats: adding/removing members, muting, pinning, changing roles, and retrieving lists of members.
- **`message`**: Contains the mutation logic handling messaging cycles: pushing items to DB, fetching histories, editing, and wiping messages.
- **`user`**: Encapsulates user processes: authenticating, creating users, searching users, fetching profiles, and updating tokens.

## 3. Technology Stack
- **Languages & Engine**: Node.js, TypeScript (v5)
- **Frontend / Web App**: Next.js 16, React 19, Tailwind CSS 4, Zustand (state-management), Lucide React (Icons).
- **Backend Services**: Express, Socket.IO.
- **Auth Layer**: NextAuth (v5 / auth/core), BcryptJS, JWT.
- **Datastores & Caches**: MongoDB (`mongoose`), Redis (`redis`).
- **Infrastructure Tooling**: Docker Compose (bundles MongoDB and Redis into isolated local persistence layers), PNPM.

## 4. System Architecture
1. **Frontend Client (apps/web)**: Next.js renders the initial UI components. Users interact with Zustand states connected to custom socket hooks. The NextAuth context authenticates API requests seamlessly into the system.
2. **API & Realtime Gateway (apps/socket)**: The central messaging logic router. Operating on explicit namespaces/events (`packages/socket/src/handlers`), it receives requests from clients and intercepts them via `authMiddleware` to confirm user sessions securely.
3. **Business Process Modules (packages/...)**: Both the HTTP endpoints in Next.js and the WebSocket handlers in the socket server utilize standard function calls exposed through the internal workspaces to execute DB mutations in MongoDB. It strongly enforces separation of concerns—views don't handle logic, socket events don't dictate DB structures.
4. **Data Layer (MongoDB + Redis)**: MongoDB represents the source of truth, structured comprehensively via the `db` package. Alternatively, `Redis` supplements the web socket's state across instances enabling immediate and transient pub-sub synchronization (e.g., active user statuses, high-throughput session checks).

## 5. Application Core Workflow
1. **Enrollment**: A user signs up through `apps/web/(auth)`. NextAuth handles routing, invoking `packages/user` functions to insert documents securely to MongoDB.
2. **Accessing Chats**: On entering `apps/web/(app)`, the client application issues an initial load via normal web responses, simultaneously establishing a long-lived Web-Socket connection to `apps/socket` initialized globally with credentials.
3. **State Syncing**: The `socket` system confirms JWT existence and connects to `Redis` (via `connectRedis`) signaling that the connection ID is active.
4. **Messaging**: The user triggers `sendMessage` events via UI components on the client which transmit payloads over websockets. The `.on('message')` listeners located inside `socket/handlers/` interpret the structure, use `packages/message/src/sendMessage.ts` to perform database modifications statically, then trigger a pub-sub emit back to relevant listening client IDs in `socket.io`.
