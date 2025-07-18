import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { IMessage } from "@crewchat/db";

export function useSocket(chatId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.emit("join", chatId);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback((message: IMessage) => {
    socketRef.current?.emit("send-message", { chatId, message });
  }, [chatId]);

  const onMessage = useCallback((callback: (msg: IMessage) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.off("receive-message");
    socket.on("receive-message", callback);
  }, []);

  return { sendMessage, onMessage };
}
