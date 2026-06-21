import { Server } from "socket.io";
import { redis } from "../server/redis";

interface ChatJoinEvent {
  type: "chat:join";
  userId: string;
  chatId: string;
}

interface ChatJoinManyEvent {
  type: "chat:join:many";
  userIds: string[];
  chatId: string;
}

interface ChatLeaveEvent {
  type: "chat:leave";
  userId: string;
  chatId: string;
}

interface UserStatusEvent {
  type: "user:status:update";
  userId: string;
  status: string;
}

type UserEvent = ChatJoinEvent | ChatJoinManyEvent | ChatLeaveEvent | UserStatusEvent;

export async function handleUserEvent(io: Server, event: UserEvent) {
  switch (event.type) {
    case "chat:join":
      try {
        await redis.del(`user:memberships:${event.userId}`);
      } catch (err) {
        console.error("[UserEvent] Failed to invalidate membership cache:", err);
      }
      io.in(`user:${event.userId}`).socketsJoin(`chat:${event.chatId}`);
      break;

    case "chat:join:many":
      try {
        await Promise.all(event.userIds.map((id) => redis.del(`user:memberships:${id}`)));
      } catch (err) {
        console.error("[UserEvent] Failed to invalidate membership cache batch:", err);
      }
      for (const id of event.userIds) {
        io.in(`user:${id}`).socketsJoin(`chat:${event.chatId}`);
      }
      break;

    case "chat:leave":
      try {
        await redis.del(`user:memberships:${event.userId}`);
      } catch (err) {
        console.error("[UserEvent] Failed to invalidate membership cache:", err);
      }
      io.in(`user:${event.userId}`).socketsLeave(`chat:${event.chatId}`);
      break;

    case "user:status:update":
      io.to(`user:${event.userId}`).emit("user:status", {
        status: event.status,
      });
      break;
  }
}
