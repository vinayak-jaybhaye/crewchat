import { useEffect, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { MessageDTO } from "@/lib/types/message.types";

export function useChatSocket(chatId: string) {
  const socket = getSocket();

  // join / leave room (and rejoin on reconnect)
  useEffect(() => {
    if (!chatId) return;

    const join = () => {
      socket.emit("chat:open", { chatId });
    };

    // join immediately (Socket.IO queues if not connected yet)
    join();

    // rejoin on reconnect
    socket.on("connect", join);

    return () => {
      socket.emit("chat:close", { chatId });
      socket.off("connect", join);
    };
  }, [chatId, socket]);

  // subscribe safely
  const onMessage = useCallback(
    (handler: (msg: MessageDTO) => void) => {
      socket.on("message:new", handler);

      return () => {
        socket.off("message:new", handler);
      };
    },
    [socket]
  );

  return { onMessage };
}
