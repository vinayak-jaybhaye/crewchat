# CrewChat

## Overview
CrewChat is a real-time communication platform built with a modern tech stack. It features a Next.js frontend for the user interface and a dedicated backend server for handling real-time messaging and WebRTC signaling. The project is organized as a monorepo using Turborepo to ensure efficient build and development workflows.

## Technology Stack

- **Frontend**: Next.js (App Router), React, TailwindCSS
- **Backend / Real-time**: Node.js, Socket.io, WebRTC
- **Database**: MongoDB (Mongoose)
- **Monorepo Management**: Turborepo, pnpm
- **Languages**: TypeScript

## Project Architecture

The codebase is structured as a monorepo with the following components:

### Apps
- **`apps/web`**: The main frontend application built with Next.js.
- **`apps/socket-server`**: A Node.js server responsible for WebSocket connections and WebRTC signaling.

### Packages
- **`packages/db`**: Shared database logic, including Mongoose models and connection setup.
- **`packages/types`**: Shared TypeScript type definitions used across apps and packages.
- **`packages/utils`**: Common utility functions.
- **`packages/typescript-config`**: Base TypeScript configurations.
- **`packages/eslint-config`**: Shared ESLint rules.

## Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher is required.
- **pnpm**: The project uses pnpm for dependency management.
- **MongoDB**: Ensure you have a MongoDB instance running locally or have a connection URI ready.

### Installation

1. Clone the repository to your local machine.
2. Install dependencies from the root directory:
   ```bash
   pnpm install
   ```

### Development

To start the development environment for all applications simultaneously:

```bash
pnpm dev
```

This command uses Turborepo to run the dev scripts for both `apps/web` and `apps/socket-server` in parallel.

#### Running Individual Apps

If you prefer to run applications separately:

- **Web App**:
  ```bash
  pnpm dev:web
  ```

- **Socket Server**:
  ```bash
  pnpm dev:socket
  ```

### Building

To build all packages and applications for production:

```bash
pnpm build
```

## Available Scripts

The following scripts are available in the root `package.json`:

- `pnpm dev`: Starts the development servers.
- `pnpm build`: Builds the project for production.
- `pnpm lint`: Runs ESLint across the codebase.
- `pnpm format`: Formats code using Prettier.
- `pnpm check-types`: Runs TypeScript type checking.