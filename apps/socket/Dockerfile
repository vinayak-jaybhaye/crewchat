# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/socket ./apps/socket

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @crewchat/db build && \
    pnpm --filter @crewchat/types build && \
    pnpm --filter @crewchat/logger build && \
    pnpm --filter @crewchat/socket build

# Prune devDependencies to keep only production packages in node_modules
RUN pnpm prune --prod

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Copy minimal production runtime files from builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/socket ./apps/socket

WORKDIR /app/apps/socket
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
