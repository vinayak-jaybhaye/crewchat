import { Server, Socket } from "socket.io";
import { MessageDTO } from "@crewchat/types";
import { getChatMembers } from "../utils/getChatMembers";

export function handleChatEvents(io: Server, socket: Socket) {
    // Join chat room
    socket.on("join", (chatId: string) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Send chat message
    socket.on("send-message", async ({ chatId, message }: { chatId: string; message: MessageDTO }) => {
        io.to(chatId).emit("receive-message", message);

        const members = await getChatMembers(chatId);
        if (members.length === 0) return;

        members.forEach((memberId) => {
            io.to(memberId).emit("notification", message);
        });
    });

}
