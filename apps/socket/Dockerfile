# Build from repository root:
#   docker build -f apps/socket/Dockerfile -t crewchat-socket .
FROM node:20-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/socket ./apps/socket

RUN pnpm install --frozen-lockfile
RUN pnpm build:db && pnpm build:socket

WORKDIR /app/apps/socket
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
