"use client";

import { Call } from "@/store/call.store";
import { useSocket } from "@/components/providers/SocketProvider";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, Maximize2, Minimize2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/user.store";
import { ProfilePic } from "@/components/user";
import { CallBar } from "../call/CallBar";

export default function CallScreen({ call }: { call: Call }) {
  const [minimized, setMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const { endCall } = useSocket();
  const { data: session } = useSession();
  const otherUserId = call.callerId === session?.user?.mongoId ? call.calleeId : call.callerId;

  const otherUserDetails = useUserStore((state) => state.getUserById(otherUserId));

  useEffect(() => {
    if (!call.connectedAt) return;

    const update = () => {
      setCallDuration(Date.now() - (call.connectedAt || call.createdAt));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [call.callId, call.connectedAt]);

  const {
    localStream,
    remoteStream,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
  } = useWebRTC(call);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <div>
      <CallBar
        username={otherUserDetails?.username || otherUserId}
        avatarUrl={otherUserDetails?.avatarUrl}
        duration={formatDuration(callDuration)}
        isAudioEnabled={isAudioEnabled}
        toggleAudio={toggleAudio}
        onExpand={() => setMinimized(false)}
        onEnd={() => endCall({ callId: call.callId })}
      />

      <div className={`fixed inset-0 bg-black z-50 ${minimized ? 'hidden' : 'flex'} flex-col`}>
        {/* Media area */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {call.type === "VIDEO" ? (
            <>
              {/* Remote video (main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover bg-black"
              />

              {/* Local video (PiP) */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-4 right-4 w-28 h-40 sm:w-36 sm:h-48 md:w-44 md:h-60 rounded-xl
                         object-cover bg-zinc-800 shadow-lg border border-white/10"
              />
            </>
          ) : (

            /* Voice call UI */
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-zinc-800 flex items-center justify-center">
                  <ProfilePic src={otherUserDetails?.avatarUrl} name={otherUserDetails?.username || "U"} size={96} />
                </div>
                <p className="text-zinc-400 text-sm sm:text-base">
                  {otherUserDetails?.username || otherUserId}
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Duration */}
        <div className="text-center text-zinc-400 font-bold pt-4">
          {
            formatDuration(callDuration)
          }
        </div>

        {/* Controls */}
        <div className="p-6 flex justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`${isAudioEnabled ? "bg-zinc-700" : "bg-red-600"} px-4 py-2 rounded-full text-white cursor-pointer`}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </button>

          {call.type === "VIDEO" && (
            <button
              onClick={toggleVideo}
              className={`${isVideoEnabled ? "bg-zinc-700" : "bg-red-600"} px-4 py-2 rounded-full text-white cursor-pointer`}
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </button>
          )}

          <button
            onClick={() => endCall({ callId: call.callId })}
            className="bg-red-600 px-6 py-3 rounded-full text-white cursor-pointer"
          >
            <Phone className="inline-block" />
          </button>
        </div>
        <div>
          <Minimize2 className="absolute top-4 right-4 text-white cursor-pointer" onClick={() => setMinimized(true)} />
        </div>
      </div>
    </div>
  );
}
