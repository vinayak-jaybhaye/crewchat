import { Server, Socket } from "socket.io";
import { getAllChatIds } from "../db/getAllChatIds";
import { registerCallHandler } from "./call.handler";
import { registerWebRTCHandler } from "./webrtc.handler";
import type { RedisClient } from "../server/redis";

export async function registerConnectionHandler(io: Server, redis: RedisClient) {
  io.on("connection", async (socket: Socket) => {
    // const userId = socket.data.userId;
    const userId = socket.data.userId;

    if (!userId) {
      console.warn("Socket connected without userId, disconnecting");
      socket.disconnect();
      return;
    }

    const chatIds = await getAllChatIds(userId);

    // join user room and chat rooms
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected via socket ${socket.id}`);

    chatIds.forEach((chatId) => {
      socket.join(`chat:${chatId}`);
    });
    console.log(`User ${userId} joined chats`, chatIds);

    // register other handlers
    registerCallHandler(io, socket, redis);
    registerWebRTCHandler(socket);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected (${socket.id})`);
    });
  });
}