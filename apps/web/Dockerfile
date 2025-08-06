FROM node:18-alpine

RUN corepack enable
WORKDIR /app

COPY . .

# Install all dependencies
RUN pnpm install --filter @crewchat/web...
RUN pnpm build:web

EXPOSE 3000

CMD ["pnpm", "start:web"]