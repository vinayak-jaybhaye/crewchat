import { Server } from "socket.io";
import { redisSub } from "../server/redis";
import { handleChatEvent } from "./chatEventHandler";
import { handleUserEvent } from "./userEventHandler";

export async function registerRedisHandlers(io: Server) {
  await redisSub.subscribe(
    ["chat:events", "user:events"],
    async (payload, channel) => {
      const event = JSON.parse(payload);

      switch (channel) {
        case "chat:events":
          await handleChatEvent(io, event);
          break;

        case "user:events":
          await handleUserEvent(io, event);
          break;
      }
    }
  );

  console.log("Redis subscribed to chat:events and user:events");
}
