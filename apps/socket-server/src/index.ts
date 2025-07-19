import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./server/socket";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" },
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`WS server running on port ${PORT}`));
