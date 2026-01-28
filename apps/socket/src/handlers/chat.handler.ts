import { Server, Socket } from "socket.io";
import { canUserAccessChat } from "../db/canUserAccessChat";

export async function registerChatHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    // join chat room
    socket.on("chat:open", async ({ chatId }: { chatId: string }) => {
      if (!chatId || !socket.data.userId) {
        console.log(`User ${socket.data.userId} is not authorized to join chat:${chatId}`);
        return;
      }

      if (socket.rooms.has(`chat:${chatId}`)) {
        console.log(`User ${socket.data.userId} is already in chat:${chatId}`);
        return;
      }

      const userId = socket.data.userId;

      // Authoritative check (cheap EXISTS query)
      const allowed = await canUserAccessChat(userId, chatId);
      if (!allowed) {
        console.log(`User ${userId} is not authorized to join chat:${chatId}`);
        return;
      }

      socket.join(`chat:${chatId}`);
      console.log(`User ${userId} joined chat:${chatId}`);
    });
  });
}