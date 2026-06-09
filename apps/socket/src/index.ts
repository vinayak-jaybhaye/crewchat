import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { connectRedis, redis, redisSub } from "./server/redis";
import { registerConnectionHandler } from "./handlers/connection.handler";
import { registerRedisHandlers } from "./handlers/redis.handler";
import { connectToDB, disconnectFromDB } from "@crewchat/db";
import { authMiddlewareJWT } from "./middleware/auth.middleware";

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;
const REDIS_URL = process.env.REDIS_URL!;
const MONGODB_URI = process.env.MONGODB_URI!;
const AUTH_SECRET = process.env.AUTH_SECRET!;
const SOCKET_JWT_SECRET = process.env.SOCKET_JWT_SECRET!;
const PORT = Number(process.env.PORT) || 3001;

if (!CLIENT_ORIGIN) throw new Error("Missing CLIENT_ORIGIN env var");
if (!REDIS_URL) throw new Error("Missing REDIS_URL env var");
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI env var");
if (!AUTH_SECRET) throw new Error("Missing AUTH_SECRET env var");
if (!SOCKET_JWT_SECRET) throw new Error("Missing SOCKET_JWT_SECRET env var");

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

let httpServer: http.Server;

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);

  await new Promise<void>((resolve) => {
    if (!httpServer) {
      resolve();
      return;
    }
    httpServer.close(() => resolve());
  });

  try {
    await redisSub?.quit();
    await redis?.quit();
  } catch (err) {
    console.error("Redis shutdown error:", err);
  }

  try {
    await disconnectFromDB();
  } catch (err) {
    console.error("MongoDB shutdown error:", err);
  }

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

async function startServer() {
  const redisClient = await connectRedis(REDIS_URL);
  await connectToDB(MONGODB_URI);

  httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.use(authMiddlewareJWT);

  await registerConnectionHandler(io, redisClient);
  await registerRedisHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start socket server:", err);
  process.exit(1);
});
