import { Socket } from "socket.io";

export function registerWebRTCHandler(
  socket: Socket,
) {
  const userId = socket.data.userId;
  if (!userId) return;

  socket.on("webrtc:offer", ({ callId, sdp }) => {
    if (!socket.rooms.has(`call:${callId}`)) return;

    socket.to(`call:${callId}`).emit("webrtc:offer", { callId, sdp });
  });

  socket.on("webrtc:answer", ({ callId, sdp }) => {
    if (!socket.rooms.has(`call:${callId}`)) return;

    socket.to(`call:${callId}`).emit("webrtc:answer", { callId, sdp });
  });

  socket.on("webrtc:ice", ({ callId, candidate }) => {
    if (!socket.rooms.has(`call:${callId}`)) return;

    socket.to(`call:${callId}`).emit("webrtc:ice", { callId, candidate });
  });
}
