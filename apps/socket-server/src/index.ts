import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/", (_, res) => res.send("WebSocket Server is running."));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.send("Welcome to the chat server!");

  socket.on("join", (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  socket.on("send-message", ({ chatId, message }: { chatId: string; message: any }) => {
    io.to(chatId).emit("receive-message", { chatId, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`WS server running on port ${PORT}`));
