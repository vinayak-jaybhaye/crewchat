import { Server, Socket } from "socket.io";
import { MessageDTO } from "@crewchat/types";

export function handleChatEvents(io: Server, socket: Socket) {
    // Join chat room
    socket.on("join", (chatId: string) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Send chat message
    socket.on("send-message", ({ chatId, message }: { chatId: string; message: MessageDTO }) => {
        io.to(chatId).emit("receive-message", message);
    });
}
