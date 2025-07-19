import { Server, Socket } from "socket.io";
import { MessageDTO } from '@crewchat/types'

export function setupSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        socket.on("join", (chatId: string) => {
            socket.join(chatId);
            console.log(`User ${socket.id} joined chat ${chatId}`);
        });

        socket.on("send-message", ({ chatId, message }: { chatId: string, message: MessageDTO }) => {
            io.to(chatId).emit("receive-message", message);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
