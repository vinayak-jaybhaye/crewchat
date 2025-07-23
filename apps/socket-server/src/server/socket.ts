import { Server, Socket } from "socket.io";
import { handleChatEvents } from "../handlers/chat";
import { handleWebRTCEvents } from "../handlers/webrtc";
import { handleCallEvents } from "../handlers/call";

export function setupSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("User connected:", socket.id);

        handleChatEvents(io, socket)
        handleCallEvents(io, socket);
        handleWebRTCEvents(io, socket);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
