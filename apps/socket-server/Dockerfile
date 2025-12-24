# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# ---------- Build ----------
FROM base AS build

# Copy workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/socket-server/package.json ./apps/socket-server/package.json

# Install ALL deps needed to build
RUN pnpm install --filter @crewchat/socket-server...

# Copy source and build
COPY apps/socket-server ./apps/socket-server
RUN pnpm --filter @crewchat/socket-server build

# ---------- Runtime ----------
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime package.json
COPY apps/socket-server/package.json ./

# Install ONLY production deps (THIS IS THE KEY)
RUN pnpm install --prod

# Copy built output
COPY --from=build /app/apps/socket-server/dist ./dist

EXPOSE 3001
CMD ["node", "dist/index.js"]
