"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chat.store";
import { MessageDTO as Message } from "@/lib/types/message.types";

type SocketContextType = {
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    let socket: ReturnType<typeof getSocket> | null = null;
    let active = true;

    async function connectSocket() {
      try {
        // Fetch short-lived socket token
        const res = await fetch("/api/socket-token");
        if (!res.ok) return;

        const { token } = await res.json();
        if (!active) return;

        // Create socket with token
        socket = getSocket(token);

        // Register listeners
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        // New message update
        socket.on("message:new", (message: Message) => {
          useChatStore.getState().addMessage(message);
        });

        // Message edit update
        socket.on("message:edit", ({ chatId, messageId, content }) => {
          useChatStore.getState().updateMessage(chatId, {
            messageId,
            content,
            editedAt: new Date().toISOString(),
          } as any);
        });

        // Message delete Update
        socket.on("message:delete", ({ chatId, messageId }) => {
          useChatStore.getState().deleteMessage(chatId, {
            messageId,
            deletedAt: new Date().toISOString(),
          } as any);
        });

        // Connect
        socket.connect();
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    }

    connectSocket();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [status]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
