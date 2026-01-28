import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { connectRedis } from "./server/redis";
import { registerConnectionHandler } from "./handlers/connection.handler";
import { registerChatHandlers } from "./handlers/chat.handler";
import { registerRedisHandlers } from "./handlers/redis.handler";
import { connectToDB } from "@crewchat/db";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;
const REDIS_URL = process.env.REDIS_URL!;
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const PORT = process.env.PORT || 3001;

if (!CLIENT_ORIGIN) throw new Error("Missing CLIENT_ORIGIN env var");
if (!REDIS_URL) throw new Error("Missing REDIS_URL env var");
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI env var");
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env var");

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

async function startServer() {
    const redis = await connectRedis(REDIS_URL);
    await connectToDB(MONGODB_URI);

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_ORIGIN,
            credentials: true,
        },
    });

    // auth middleware
    // io.use(authMiddleware);

    // register handlers
    registerConnectionHandler(io);
    registerChatHandlers(io);
    await registerRedisHandlers(io);

    httpServer.listen(PORT, () => {
        console.log(`Socket server running on port ${PORT}`);
    });
}

startServer();
