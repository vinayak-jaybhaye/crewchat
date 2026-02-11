"use client";

import { useEffect, useRef, useState } from "react";
import { Call } from "@/store/call.store";
import { useSocket } from "@/components/providers/SocketProvider";
import { useSession } from "next-auth/react";
import { useWebRTCStore } from "@/store/webrtc.store";

const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],
};

export function useWebRTC(call: Call) {
  const { data: session } = useSession();
  const { sendOffer, sendAnswer, sendIceCandidate } = useSocket();
  const { signal, clearSignal } = useWebRTCStore();

  const isCaller = call.callerId === session?.user?.mongoId;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // INIT WEBRTC
  useEffect(() => {
    let active = true;

    async function init() {
      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;

      // Remote stream
      const remote = new MediaStream();
      remoteStreamRef.current = remote;
      setRemoteStream(remote);

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendIceCandidate({
            callId: call.callId,
            candidate: e.candidate,
          });
        }
      };

      // Local media
      const constraints =
        call.type === "VIDEO"
          ? { audio: true, video: true }
          : { audio: true, video: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!active) return;

      localStreamRef.current = stream;
      setLocalStream(stream);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Caller creates offer
      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendOffer({
          callId: call.callId,
          sdp: offer,
        });
      }
    }

    init();

    return () => {
      active = false;

      pcRef.current?.close();
      pcRef.current = null;

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current?.getTracks().forEach((t) => t.stop());

      localStreamRef.current = null;
      remoteStreamRef.current = null;

      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [call.callId, call.rtcVersion]);

  // HANDLE SIGNALING
  useEffect(() => {
    if (!signal) return;
    if (signal.callId !== call.callId) return;
    if (!pcRef.current) return;

    async function handle() {
      const pc = pcRef.current!;
      if (!signal) return;
      if (signal.type === "offer") {
        await pc.setRemoteDescription(signal.data);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendAnswer({ callId: call.callId, sdp: answer });
      }

      if (signal.type === "answer") {
        await pc.setRemoteDescription(signal.data);
      }

      if (signal.type === "ice") {
        await pc.addIceCandidate(signal.data);
      }

      clearSignal();
    }

    handle();
  }, [signal, call.callId, call.rtcVersion]);

  // TOGGLES
  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
  };

  return {
    localStream,
    remoteStream,

    toggleAudio,
    toggleVideo,
  };
}
