import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { MessageDTO } from "@crewchat/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined in the environment variables.");
}

export function useSocket(chatId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("join", chatId);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback((message: MessageDTO) => {
    socketRef.current?.emit("send-message", { chatId, message });
  }, [chatId]);

  const onMessage = useCallback((callback: (msg: MessageDTO) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.off("receive-message");
    socket.on("receive-message", callback);
  }, []);

  return { sendMessage, onMessage };
}
