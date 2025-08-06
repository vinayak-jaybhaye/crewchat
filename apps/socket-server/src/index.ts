import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./server/socket";
import { connectRedis } from "./server/redis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

if (!process.env.CLIENT_ORIGIN) {
  throw new Error("CLIENT_ORIGIN is not defined in the environment variables.");
}

const app = express();
app.use(cors());

async function startServer() {
  await connectRedis(); // Connect to Redis before starting WS

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN },
  });

  setupSocket(io);

  const PORT = process.env.PORT || 3001;
  server.listen({
    port: PORT,
    host: '0.0.0.0',
  }, () => {
    console.log(`✅ WS server running on port ${PORT}`);
  });

}

startServer(); 
