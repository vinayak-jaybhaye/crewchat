'use client'

import { useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

interface VideoCallWindowProps {
  socket: any;
  remoteUserId: string;
  localUserId: string;
  DeleteCall?: () => void;
}

export function VideoCallWindow({
  socket,
  remoteUserId,
  localUserId,
  DeleteCall,
}: VideoCallWindowProps) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);

  if (!socket || !remoteUserId || !localUserId) {
    console.error("VideoCallWindow requires socket, remoteUserId, and localUserId");
    return null;
  }

  const {
    localStream,
    remoteStream,
    hangUp,
    startCall,
  } = useWebRTC({ socket, remoteUserId, localUserId, callType: 'video' });

  // Set video streams
  useEffect(() => {
    if (localRef.current && localStream && localRef.current.srcObject !== localStream) {
      localRef.current.srcObject = localStream;
      localRef.current
        .play()
        .catch((err) => console.warn("Local video play error:", err));
      console.log("LOCAL VIDEO PLAYED");
    }

    if (remoteRef.current && remoteStream && remoteRef.current.srcObject !== remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      remoteRef.current
        .play()
        .catch((err) => console.warn("Remote video play error:", err));
      console.log("REMOTE VIDEO PLAYED");
    }
  }, [localStream, remoteStream]);

  // Start call on mount
  useEffect(() => {

    const init = async () => {
      try {
        await startCall();
      } catch (err) {

        console.error("Error starting call:", err);

      }
    };

    init();

    return hangUp;
  }, [remoteUserId, localUserId]);

  const handleEndCall = () => {
    hangUp();
    if (DeleteCall) DeleteCall();

    console.log("Call ended by user");
  };

  return (
    <div className="relative inset-0 bg-black text-white flex flex-col items-center justify-center gap-4 z-50">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="w-64 h-64 md:w-80 md:h-80 rounded-lg border"
      />
      <video
        ref={localRef}
        autoPlay
        playsInline
        muted
        className="w-32 h-32 md:w-40 md:h-40 rounded-lg border absolute bottom-4 right-4"
      />
      <button
        onClick={handleEndCall}
        className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
      >
        End Call
      </button>
    </div>
  );
}
