'use client'

import { useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

interface VideoCallWindowProps {
  socket: any;
  remoteUserId: string;
  localUserId: string;
  caller: string;
  DeleteCall: () => void;
}

export function VideoCallWindow({
  socket,
  remoteUserId,
  localUserId,
  DeleteCall,
  caller
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

  const pauseMediaStreams = () => {
    if (localRef.current) {
      localRef.current.pause();
      localRef.current.srcObject = null;
    }
    if (remoteRef.current) {
      remoteRef.current.pause();
      remoteRef.current.srcObject = null;
    }
  }

  // Start call on mount
  useEffect(() => {
    const init = async () => {
      try {
        await startCall();
      } catch (err) {
        console.error("Error starting call:", err);
      }
    };

    socket.on('reconnect-needed', () => {
      if (caller === localUserId) init()
    })
    if (localUserId === caller) init();

    return () => {
      socket.off('reconnect-needed');
      hangUp();
      pauseMediaStreams();
    };
  }, [remoteUserId, localUserId]);

  // Set video streams
  useEffect(() => {
    const localVideo = localRef.current;

    if (localVideo && localStream && localVideo.srcObject !== localStream) {
      localVideo.srcObject = localStream;
      requestAnimationFrame(() => {
        localVideo
          .play()
          .then(() => console.log("LOCAL VIDEO PLAYED"))
          .catch((err) => console.warn("Local video play error:", err));
      });
    }
  }, [localStream]);

  useEffect(() => {
    const remoteVideo = remoteRef.current;

    if (remoteVideo && remoteStream && remoteVideo.srcObject !== remoteStream) {
      remoteVideo.srcObject = remoteStream;
      requestAnimationFrame(() => {
        remoteVideo
          .play()
          .then(() => console.log("REMOTE VIDEO PLAYED"))
          .catch((err) => console.warn("Remote video play error:", err));
      });
    }
  }, [remoteStream])


  const handleEndCall = () => {
    pauseMediaStreams();
    hangUp();
    DeleteCall();
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
