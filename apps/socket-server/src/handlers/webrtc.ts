import { Server, Socket } from "socket.io";

export function handleWebRTCEvents(io: Server, socket: Socket) {

    socket.on("webrtc-offer", ({ from, to, offer, midMap }) => {
        io.to(to).emit("webrtc-offer", { from, to, offer, midMap });
    });

    socket.on("webrtc-answer", ({ from, to, answer }) => {
        io.to(to).emit("webrtc-answer", { from, to, answer });
    });

    socket.on("webrtc-ice-candidate", ({ from, to, candidate }) => {
        console.log(`Sending ICE candidate to ${to} from ${from}`);
        io.to(to).emit("webrtc-ice-candidate", { from, to, candidate });
    });
}
