import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./server/socket";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
// Ensure environment variables are loaded
if (!process.env.CLIENT_ORIGIN) {
  throw new Error("CLIENT_ORIGIN is not defined in the environment variables.");
}

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN },
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`WS server running on port ${PORT}`));
