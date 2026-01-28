import { Server } from "socket.io";

interface UserStatusEvent {
  type: "user:status:update";
  userId: string;
  status: string;
}

export function handleUserEvent(io: Server, event: UserStatusEvent) {
  if (event.type !== "user:status:update") return;

  io.to(`user:${event.userId}`).emit("user:status", {
    status: event.status,
  });

  console.log(
    `User ${event.userId} status updated to ${event.status}`
  );
}
