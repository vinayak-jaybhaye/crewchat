"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
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

  startCall: (payload: CallStartPayload) => void;
  acceptCall: (payload: CallAcceptPayload) => void;
  endCall: (payload: CallEndPayload) => void;

  // webrtc
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

  startCall: noop,
  acceptCall: noop,
  endCall: noop,
  sendOffer: noop,
  sendAnswer: noop,
  sendIceCandidate: noop,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;

    async function connectSocket() {
      try {
        // Fetch short-lived socket token
        const res = await fetch("/api/socket-token", {
          credentials: "include",
        });
        if (!res.ok) return;

        const { token } = await res.json();
        if (!active) return;

        // Create socket with token
        socketRef.current = getSocket(token);
        const socket = socketRef.current;

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

        // ----- CALL EVENTS -----
        // Incoming call (callee)
        socket.on("call:incoming", (call) => {
          useCallStore.getState().incomingCall(call);
        });

        // Outgoing call (caller confirmation)
        socket.on("call:outgoing", (call) => {
          useCallStore.getState().startCall(call);
        });

        // Call connected (both users)
        socket.on("call:connected", (call) => {
          useCallStore.getState().connectCall(call);
        });

        // Call ended
        socket.on("call:ended", ({ callId, endedBy }) => {
          useCallStore.getState().endCall(callId, endedBy);
        });

        // Call resume (reconnect / refresh)
        socket.on("call:resume", (call) => {
          if (call.state === "CONNECTED") {
            useCallStore.getState().resumeCall(call);
          } else {
            useCallStore.getState().incomingCall(call);
          }
        });

        // ----- WEBRTC SIGNALING -----
        // WebRTC signaling
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

        // Connect
        socket.connect();
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    }

    connectSocket();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [status]);

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

  // WEBRTC SIGNALING
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

  return (
    <SocketContext.Provider
      value={{
        isConnected,
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
