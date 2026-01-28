import { Server, Socket } from "socket.io";
import { getAllChatIds } from "../db/getAllChatIds";

export async function registerConnectionHandler(io: Server) {
  io.on("connection", async (socket: Socket) => {
    // const userId = socket.data.userId;
    const userId = socket.handshake.auth.userId;

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
      console.log(`User ${userId} joined chat ${chatId}`);
      socket.join(`chat:${chatId}`);
    });


    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected (${socket.id})`);
    });
  });
}