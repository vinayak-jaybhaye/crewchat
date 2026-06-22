import { Socket } from "socket.io";
import { canUserAccessChat } from "../db/canUserAccessChat";
import { filterAccessibleChats } from "../db/filterAccessibleChats";

export function registerChatHandlersForSocket(socket: Socket) {
  socket.on("chat:subscribe", async ({ chatIds }: { chatIds: string[] }) => {
    const userId = socket.data.userId;
    if (!userId || !Array.isArray(chatIds)) return;

    const allowed = await filterAccessibleChats(userId, chatIds);
    for (const chatId of allowed) {
      socket.join(`chat:${chatId}`);
    }
  });

  socket.on("chat:open", async ({ chatId }: { chatId: string }) => {
    const userId = socket.data.userId;
    if (!chatId || !userId) return;
    if (socket.rooms.has(`chat:${chatId}`)) return;

    const allowed = await canUserAccessChat(userId, chatId);
    if (!allowed) return;

    socket.join(`chat:${chatId}`);
  });

  socket.on("chat:typing", ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
    const userId = socket.data.userId;
    if (!chatId || !userId) return;
    socket.to(`chat:${chatId}`).emit("chat:typing", { chatId, userId, isTyping });
  });
}
