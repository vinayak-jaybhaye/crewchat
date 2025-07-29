'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGlobalSocket } from '@/context/SocketProvider';
import { useSession } from 'next-auth/react';
import { Call } from './CallWindow';
import { UserDTO } from '@crewchat/types';
import { getUserById } from '@/app/actions/UserActions';
import Image from 'next/image';
import { Phone, PhoneCall, PhoneOff, Video, VolumeX, Volume2 } from 'lucide-react';

export default function CallLobby({ call, remoteUserId, localUserId, deleteCall }: { call: Call, remoteUserId: string, localUserId: string, deleteCall: () => void }) {
  const socket = useGlobalSocket();
  const session = useSession();
  const [remoteUserData, setRemoteUserData] = useState<UserDTO | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  if (!call) return null;

  // Initialize ringtone
  useEffect(() => {
    const audio = new Audio(call.caller === localUserId ? '/sounds/caller_tune.mp3' : '/sounds/ringtone.mp3');
    audio.loop = true;
    audio.volume = 0.5; // Set default volume
    ringtoneRef.current = audio;

    // Try to play with user interaction handling
    const playRingtone = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("🔇 Ringtone play failed - user interaction required", err);
        // Try again after a small delay
        setTimeout(() => {
          audio.play().catch(() => console.warn("🔇 Ringtone still blocked"));
        }, 1000);
      }
    };

    if (!isMuted) {
      playRingtone();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = ''; // Clear the source
      }
    };
  }, [call, localUserId]); // Remove isMuted from dependencies to prevent re-initialization

  // Handle mute state changes
  useEffect(() => {
    const audio = ringtoneRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.warn("🔇 Ringtone resume failed", err));
    }
  }, [isMuted]);

  const toggleMute = () => {
    console.log("Toggle mute clicked, current state:", isMuted);
    setIsMuted(prev => !prev);
  };

  // Stop ringtone when call is accepted, rejected, or ended
  const stopRingtone = () => {
    const audio = ringtoneRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  useEffect(() => {
    async function fetchOtherUserData() {
      const userData = await getUserById(remoteUserId);
      if (userData) {
        setRemoteUserData(userData)
      } else {
        console.error("Failed to fetch user data for", remoteUserId);
      }
    }

    if (remoteUserId) fetchOtherUserData();
  }, [remoteUserId]);

  useEffect(() => {
    const startedAt = call.createdAt ? call.createdAt : Date.now();
    let ringingTime = Math.floor(Date.now() - startedAt);

    if (!startedAt) return;

    const timeout = setTimeout(() => {
      stopRingtone();
      deleteCall();
    }, Math.max(0, 60000 - ringingTime));

    return () => clearTimeout(timeout);
  }, [call, deleteCall]);

  const handleAccept = () => {
    if (!socket) return;

    stopRingtone(); // Stop ringtone immediately

    socket.emit('accept-call', {
      callId: call.callId,
    });

    console.log("Accepted Incoming call", call);
    console.log("Call accepted by", session.data?.user._id);
  };

  const handleReject = () => {
    if (!socket) return;
    stopRingtone(); // Stop ringtone immediately

    socket.emit('reject-call', {
      callId: call.callId,
    });

    console.log("Rejected Incoming call", call);
  };

  useEffect(() => {
    if (!socket) return;

    const onCallEnded = (data: { other: string }) => {
      if (call && call.caller === data.other) {
        stopRingtone();
      }
    };
    socket.on('call-ended', onCallEnded);

    return () => {
      socket.off('call-ended', onCallEnded);
    };
  }, [socket, call]);

  const handleEndCall = () => {
    if (!socket) return;

    stopRingtone(); // Stop ringtone immediately

    socket.emit('hang-up', {
      callId: call.callId,
      by: session.data?.user._id,
    });

    console.log("Call ended by", session.data?.user._id);
  }

  const isIncomingCall = call.callee === session.data?.user._id;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>

        {/* Mute Button - Fixed positioning and styling */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${isMuted
              ? 'bg-red-600/80 hover:bg-red-500/80 text-white'
              : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white'
              }`}
            title={isMuted ? "Unmute ringtone" : "Mute ringtone"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {isIncomingCall ? (
          /* Incoming Call UI */
          <div className="relative p-8 text-center space-y-6">
            {/* Call Type Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full border border-blue-500/30">
                {call.type === 'video' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <PhoneCall className="w-4 h-4" />
                )}
                <span className="text-sm font-medium capitalize">Incoming {call.type} call</span>
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                {remoteUserData?.avatarUrl ? (
                  <div className="relative">
                    <Image
                      src={remoteUserData.avatarUrl}
                      width={120}
                      height={120}
                      alt="Avatar"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-600/50 shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-slate-600/50 shadow-xl">
                    {remoteUserData?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                {/* Pulsing ring animation - only show when not muted */}
                {!isMuted && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping animation-delay-1000"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping animation-delay-500 scale-125"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-green-400/10 animate-ping animation-delay-1500 scale-150"></div>
                  </>
                )}
                {/* Static rings when muted */}
                {isMuted && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-slate-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-slate-400/20 scale-125"></div>
                  </>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {remoteUserData?.username || 'Unknown User'}
              </h2>
              <div className="text-slate-400 flex items-center justify-center gap-2">
                {!isMuted && (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse animation-delay-400"></div>
                  </div>
                )}
                {isMuted && (
                  <VolumeX className="w-4 h-4 text-red-400" />
                )}
                is calling you...
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6 pt-4">
              <button
                className="group relative p-4 rounded-full bg-red-600/90 hover:bg-red-500 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-600/30"
                onClick={handleReject}
              >
                <PhoneOff className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Reject
                </div>
              </button>

              <button
                className="group relative p-4 rounded-full bg-green-600/90 hover:bg-green-500 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-green-600/30 animate-pulse"
                onClick={handleAccept}
              >
                <Phone className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-300" />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Accept
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Call in Progress UI */
          <div className="relative p-8 text-center space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Call in progress</span>
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                {remoteUserData?.avatarUrl ? (
                  <div className="relative">
                    <Image
                      src={remoteUserData.avatarUrl}
                      width={120}
                      height={120}
                      alt="Avatar"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-600/50 shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-slate-600/50 shadow-xl">
                    {remoteUserData?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full border-2 border-green-500/20"></div>
              </div>
            </div>

            {/* Call Info */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {remoteUserData?.username || 'Unknown User'}
              </h2>
              <p className="text-slate-400">
                {call.type === 'video' ? 'Video' : 'Audio'} call in progress
              </p>
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                className="group relative p-3 rounded-full bg-red-600/90 hover:bg-red-500 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-600/30"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Tap the red button to end the call
            </p>
          </div>
        )}
      </div>

      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/30 rounded-full animate-ping animation-delay-2000"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-500/30 rounded-full animate-ping animation-delay-3000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-500/30 rounded-full animate-ping animation-delay-1000"></div>
    </div>
  );
}