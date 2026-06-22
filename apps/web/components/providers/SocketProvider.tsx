"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { getSocket, updateSocketToken, destroySocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chat.store";
import { useCallStore } from "@/store/call.store";
import { useWebRTCStore } from "@/store/webrtc.store";
import { MessageDTO as Message } from "@/lib/types/message.types";

export interface CallStartPayload {
  calleeId: string;
  type: "VOICE" | "VIDEO";
}

export interface CallAcceptPayload {
  callId: string;
}

export interface CallEndPayload {
  callId: string;
}

type SocketContextType = {
  isConnected: boolean;

  subscribeChats: (chatIds: string[]) => void;
  openChat: (chatId: string) => void;
  sendTyping: (payload: { chatId: string; isTyping: boolean }) => void;

  startCall: (payload: CallStartPayload) => void;
  acceptCall: (payload: CallAcceptPayload) => void;
  endCall: (payload: CallEndPayload) => void;

  sendOffer: (payload: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;
  sendAnswer: (payload: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
  }) => void;
  sendIceCandidate: (payload: {
    callId: string;
    candidate: RTCIceCandidate;
  }) => void;
};

const noop = () => {
  throw new Error("SocketProvider not mounted");
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,

  subscribeChats: noop,
  openChat: noop,
  sendTyping: noop,

  startCall: noop,
  acceptCall: noop,
  endCall: noop,
  sendOffer: noop,
  sendAnswer: noop,
  sendIceCandidate: noop,
});

export const useSocket = () => useContext(SocketContext);

/** Refresh 3 minutes before JWT expiry */
const REFRESH_BUFFER_SECONDS = 180;

async function fetchSocketToken(): Promise<{
  token: string;
  expiresIn: number;
} | null> {
  const res = await fetch("/api/socket-token", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSubscribeRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;

    function scheduleTokenRefresh(expiresIn: number) {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      const delayMs = Math.max(
        (expiresIn - REFRESH_BUFFER_SECONDS) * 1000,
        60_000
      );

      refreshTimerRef.current = setTimeout(async () => {
        if (!active) return;

        const creds = await fetchSocketToken();
        if (!creds || !active) return;

        updateSocketToken(creds.token);
        scheduleTokenRefresh(creds.expiresIn);
      }, delayMs);
    }

    async function connectSocket() {
      try {
        const creds = await fetchSocketToken();
        if (!creds || !active) return;

        socketRef.current = getSocket(creds.token);
        const socket = socketRef.current;

        socket.on("connect", () => {
          setIsConnected(true);
          if (pendingSubscribeRef.current) {
            socket.emit("chat:subscribe", {
              chatIds: pendingSubscribeRef.current,
            });
          }
        });
        socket.on("disconnect", () => setIsConnected(false));

        socket.on("connect_error", async (err) => {
          console.error("Socket connect error:", err.message);

          const isAuthError =
            err.message.includes("jwt") ||
            err.message.includes("Unauthorized") ||
            err.message.includes("token");

          if (!isAuthError || !active) return;

          const fresh = await fetchSocketToken();
          if (!fresh || !active) return;

          updateSocketToken(fresh.token);
          scheduleTokenRefresh(fresh.expiresIn);
          socket.connect();
        });

        socket.on("message:new", (message: Message) => {
          useChatStore.getState().addMessage(message);
        });

        socket.on("message:edit", ({ chatId, messageId, content }) => {
          const bucket = useChatStore.getState().messagesByChatId[chatId];
          const existing = bucket?.entities[messageId];
          if (!existing) return;

          useChatStore.getState().updateMessage(chatId, {
            ...existing,
            content,
            editedAt: new Date().toISOString(),
          });
        });

        socket.on("message:delete", ({ chatId, messageId }) => {
          useChatStore.getState().deleteMessage(chatId, {
            messageId,
            deletedAt: new Date().toISOString(),
          });
        });

        socket.on("chat:typing", ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
          useChatStore.getState().setTyping(chatId, userId, isTyping);
        });

        socket.on("call:incoming", (call) => {
          useCallStore.getState().incomingCall(call);
        });

        socket.on("call:outgoing", (call) => {
          useCallStore.getState().startCall(call);
        });

        socket.on("call:connected", (call) => {
          useCallStore.getState().connectCall(call);
        });

        socket.on("call:ended", ({ callId, endedBy }) => {
          useCallStore.getState().endCall(callId, endedBy);
        });

        socket.on("call:resume", (call) => {
          if (call.state === "CONNECTED") {
            useCallStore.getState().resumeCall(call);
          } else {
            useCallStore.getState().incomingCall(call);
          }
        });

        socket.on("webrtc:offer", ({ callId, sdp }) => {
          useWebRTCStore.getState().pushSignal({
            type: "offer",
            callId,
            data: sdp,
          });
        });

        socket.on("webrtc:answer", ({ callId, sdp }) => {
          useWebRTCStore.getState().pushSignal({
            type: "answer",
            callId,
            data: sdp,
          });
        });

        socket.on("webrtc:ice", ({ callId, candidate }) => {
          useWebRTCStore.getState().pushSignal({
            type: "ice",
            callId,
            data: candidate,
          });
        });

        scheduleTokenRefresh(creds.expiresIn);
        socket.connect();
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    }

    connectSocket();

    return () => {
      active = false;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      destroySocket();
      socketRef.current = null;
    };
  }, [status]);

  const subscribeChats = useCallback((chatIds: string[]) => {
    pendingSubscribeRef.current = chatIds;
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("chat:subscribe", { chatIds });
    }
  }, []);

  const openChat = useCallback((chatId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("chat:open", { chatId });
  }, []);

  const startCall = (payload: CallStartPayload) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("call:start", payload);
  };

  const acceptCall = (payload: CallAcceptPayload) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("call:accept", payload);
  };

  const endCall = (payload: CallEndPayload) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("call:end", payload);
  };

  const sendOffer = ({
    callId,
    sdp,
  }: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("webrtc:offer", { callId, sdp });
  };

  const sendAnswer = ({
    callId,
    sdp,
  }: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("webrtc:answer", { callId, sdp });
  };

  const sendIceCandidate = ({
    callId,
    candidate,
  }: {
    callId: string;
    candidate: RTCIceCandidate;
  }) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("webrtc:ice", { callId, candidate });
  };

  const sendTyping = useCallback((payload: { chatId: string; isTyping: boolean }) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;
    socket.emit("chat:typing", payload);
  }, [isConnected]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        subscribeChats,
        openChat,
        sendTyping,
        startCall,
        acceptCall,
        endCall,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
