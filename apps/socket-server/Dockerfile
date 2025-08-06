FROM node:18-alpine

# Enable pnpm
RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --filter @crewchat/socket-server...
RUN pnpm build:socket

EXPOSE 3001

CMD ["pnpm", "start:socket"]
