'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import {
  requestCameraAndMicrophoneAccess,
  requestMicrophoneAccess,
} from '@/lib/permissions/media';

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] },
  ],
};

export function useWebRTC({
  socket,
  remoteUserId,
  localUserId,
  callType,
}: {
  socket: Socket | null;
  remoteUserId: string;
  localUserId: string;
  callType: 'audio' | 'video';
}) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const remoteDescriptionSet = useRef(false);

  const getMediaStream = async () => {
    const allowed = callType === 'video'
      ? await requestCameraAndMicrophoneAccess()
      : await requestMicrophoneAccess();

    if (!allowed) return null;

    return navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true,
    });
  };

  const releaseMediaStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);

    console.log('Media streams released');
  };


  const closePeerConnection = () => {
    console.log('Closing peer connection');
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    remoteDescriptionSet.current = false;
    iceCandidateQueue.current = [];
    releaseMediaStream();
  };

  const startCall = useCallback(async () => {
    if (!socket || !localUserId || !remoteUserId) return;

    closePeerConnection();
    const pc = new RTCPeerConnection(configuration);
    peerConnection.current = pc;

    const stream = await getMediaStream();
    if (!stream) return;
    setLocalStream(stream);
    localStreamRef.current = stream;

    if (pc && pc.signalingState !== "closed") {
      stream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, stream);
        } catch (err) {
          console.error("Failed to add track:", err);
        }
      });
    } else {
      console.warn("PC is already closed before addTrack()");
      return;
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          from: localUserId,
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    const remote = new MediaStream();
    setRemoteStream(remote);
    remoteStreamRef.current = stream;
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    peerConnection.current = pc;

    socket.emit('webrtc-offer', {
      from: localUserId,
      to: remoteUserId,
      offer,
    });
  }, [socket, localUserId, remoteUserId, callType]);

  useEffect(() => {
    if (!socket || !localUserId) return;

    const handleOffer = async ({ from, to, offer }: { from: string; to: string; offer: RTCSessionDescriptionInit }) => {
      if (to !== localUserId) return;

      closePeerConnection();
      const pc = new RTCPeerConnection(configuration);
      peerConnection.current = pc;

      const stream = await getMediaStream();
      if (!stream) return;
      setLocalStream(stream);
      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remote = new MediaStream();
      setRemoteStream(remote);
      remoteStreamRef.current = stream;
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            from: localUserId,
            to: from,
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      remoteDescriptionSet.current = true;

      for (const candidate of iceCandidateQueue.current) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.warn('Buffered ICE failed:', err);
        }
      }
      iceCandidateQueue.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        from: localUserId,
        to: from,
        answer,
      });
    };

    const handleAnswer = async ({ from, to, answer }: { from: string; to: string; answer: RTCSessionDescriptionInit }) => {
      if (to !== localUserId || !peerConnection.current) return;

      const pc = peerConnection.current;

      if (pc.signalingState !== "have-local-offer") {
        console.warn("Cannot setRemoteDescription(answer), invalid signaling state:", pc.signalingState);
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescriptionSet.current = true;

        for (const candidate of iceCandidateQueue.current) {
          await pc.addIceCandidate(candidate);
        }
        iceCandidateQueue.current = [];
      } catch (err) {
        console.error("Failed to set remote answer:", err);
      }
      peerConnection.current = pc;
    };

    const handleCandidate = async ({ from, to, candidate }: { from: string; to: string; candidate: RTCIceCandidateInit }) => {
      if (to !== localUserId || !peerConnection.current) return;
      const ice = new RTCIceCandidate(candidate);
      if (remoteDescriptionSet.current) {
        try {
          await peerConnection.current.addIceCandidate(ice);
        } catch (err) {
          console.warn('ICE add error:', err);
        }
      } else {
        iceCandidateQueue.current.push(ice);
      }
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleCandidate);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleCandidate);
    };
  }, [socket, localUserId]);

  const hangUp = useCallback(() => {
    closePeerConnection();
    console.log('Call ended and cleaned up.');
  }, [localStream, remoteStream, socket, localUserId, remoteUserId]);

  return { startCall, hangUp, localStream, remoteStream };
}
