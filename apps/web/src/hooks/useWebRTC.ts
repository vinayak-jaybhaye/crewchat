'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { requestMicrophoneAccess } from '@/lib/permissions/media';

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] },
  ],
};

export function useCall({
  socket,
  remoteUserId,
  localUserId,
  callType,
  isCaller = false
}: {
  socket: Socket | null;
  remoteUserId: string;
  localUserId: string;
  callType: 'audio' | 'video';
  isCaller?: boolean;
}) {
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);

  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);
  const [connectionStarted, setConnectionStarted] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [isOfferer, setIsOfferer] = useState(isCaller);
  
  
  const toggleMicrophone = async () => {
    if (!localStreamRef.current) {
      localStreamRef.current = new MediaStream();
    }

    const audioTracks = localStreamRef.current.getAudioTracks();

    if (micOn) {
      // Turn microphone OFF and release hardware
      console.log("🎤 Turning microphone OFF and releasing hardware...");

      audioTracks.forEach(track => {
        track.stop(); // This releases the hardware
        localStreamRef.current?.removeTrack(track); // Remove from stream
      });

      // Remove audio track from transceiver (stop sending audio)
      await audioTransceiverRef.current?.sender.replaceTrack(null);

      // Update the local stream state
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

      setMicOn(localStreamRef.current.getAudioTracks().length > 0);
      console.log("🎤 Microphone turned OFF, hardware released");

    } else {
      // Turn microphone ON - need to request new hardware access
      console.log("🎤 Turning microphone ON, requesting hardware access...");

      try {
        // Get new audio stream (since we released hardware)
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];

        if (audioTrack) {
          // Add new audio track to local stream
          localStreamRef.current.addTrack(audioTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

          // Add audio track to transceiver
          await audioTransceiverRef.current?.sender.replaceTrack(audioTrack);


          setMicOn(localStreamRef.current.getAudioTracks().length > 0);
          console.log("🎤 Microphone turned ON, hardware acquired");
        }
      } catch (error) {
        console.warn("❌ Error accessing microphone:", error);
        await audioTransceiverRef.current?.sender.replaceTrack(null);
        setMicOn(false);
      }
    }
  };

  // Make sure to properly clean up and recreate transceivers
  const deletePeerConnection = () => {
    if (peerConnectionRef.current) {
      console.log("🗑️ Deleting peer connection");

      // Stop and release microphone/audio tracks BEFORE nulling the ref
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
      }

      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onnegotiationneeded = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;

      // Clear all state
      setLocalStream(null);
      setRemoteStream(null);
      localStreamRef.current = null;
      remoteStreamRef.current = null;

      // IMPORTANT: Clear transceiver refs to ensure clean state
      audioTransceiverRef.current = null;


      iceCandidateQueue.current = [];
      setRemoteDescriptionSet(false);
      setConnectionStarted(false);
    }
    console.log("✅ Peer connection deleted");
  }


  const startCall = useCallback(async () => {
    if (!remoteUserId || !localUserId) {
      console.warn("⚠️ Cannot start call: already connected or peer missing");
      return;
    }
    setIsOfferer(isCaller);
    deletePeerConnection();
    console.log("📞 Starting call as", isCaller ? "caller" : "callee");
    if (isCaller) await prepareConnection();
  }, [socket, remoteUserId, localUserId, callType]);


  async function createPeerConnection() {
    if (!socket || !remoteUserId || !localUserId) return;

    console.log("🔧 Creating peer connection...");
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    const audioTsc = pc.addTransceiver("audio", { direction: "sendrecv" });

    audioTransceiverRef.current = audioTsc;

    console.log("🔁 Transceivers created:", { audio: audioTsc });

    try {
      // Request microphone access
      const mediaAccessGranted = await requestMicrophoneAccess();
      if (!mediaAccessGranted) {
        console.warn("❗ Media access denied");
        await audioTransceiverRef.current?.sender.replaceTrack(null);
      } else {
        toggleMicrophone();
      }
    } catch (error) {
      console.error("❌ Error getting local media:", error);
    }

    pc.ontrack = (event) => {
      const track = event.track;

      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      if (track.kind === 'audio') {
        console.log("📥 Received remote audio track");
        remoteStreamRef.current.addTrack(track);
        setRemoteStream(remoteStreamRef.current);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          from: localUserId,
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    if (isOfferer && !pc.signalingState.includes("closed")) {
      console.log("📤 Emitting offer from createPeerConnection");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', {
        from: localUserId,
        to: remoteUserId,
        offer,
      });
    }
    
    pc.onnegotiationneeded = async () => {
      if (true) {
        console.log("🔄 Negotiation needed, creating offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', {
          from: localUserId,
          to: remoteUserId,
          offer,
        });
      } else {
        console.warn("❗ Negotiation needed but not the offerer");
      }
    }
  }

  async function prepareConnection() {
    connectionStarted && console.warn("⚠️ Connection already started, skipping preparation");
    setConnectionStarted(true);
    if (!peerConnectionRef.current) {
      console.log("🔧 Preparing peer connection...");
      createPeerConnection();
    }
  }

  
  const handleOffer = async ({ from, to, offer }: { from: string; to: string; offer: RTCSessionDescriptionInit }) => {
    console.log("📩 Received offer from", from);
    if (!peerConnectionRef.current) {
      await createPeerConnection();
    }
    const pc = peerConnectionRef.current;
    setIsOfferer(false);
    setConnectionStarted(true);

    await pc!.setRemoteDescription(offer);
    setRemoteDescriptionSet(true);
    console.log("✅ Set remote description (offer)");

    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc!.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ Applied queued ICE candidate");
      } catch (err) {
        console.error("❌ Error applying queued ICE", err);
      }
    }
    iceCandidateQueue.current = [];

    const answer = await pc!.createAnswer();
    await pc!.setLocalDescription(answer);
    console.log("📤 Sending answer to", from);

    socket!.emit('webrtc-answer', {
      from: localUserId,
      to: from,
      answer,
    });
  };

  const handleAnswer = async ({ from, to, answer }: { from: string; to: string; answer: RTCSessionDescriptionInit }) => {
    if (to !== localUserId || !peerConnectionRef.current) return;
    const pc = peerConnectionRef.current;

    await pc.setRemoteDescription(new RTCSessionDescription(answer));
    setRemoteDescriptionSet(true);
    console.log("✅ Set remote description (answer)");

    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("✅ Applied queued ICE candidate (answer)");
      } catch (err) {
        console.error("❌ Error applying ICE (answer)", err);
      }
    }
    iceCandidateQueue.current = [];
  };

  const handleCandidate = async ({ from, to, candidate }: { from: string; to: string; candidate: RTCIceCandidate }) => {
    const pc = peerConnectionRef.current;
    if (to !== localUserId || !pc) return;
    if (!remoteDescriptionSet) {
      console.log("📥 Queuing ICE candidate (remoteDescription not set)");
      iceCandidateQueue.current.push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("✅ Added ICE candidate directly");
    } catch (err) {
      console.error("❌ Error adding ICE candidate:", err);
    }
  };

  const handleReconnectNeeded = async () => {
    console.warn("🔄 Reconnect needed, deleting peer connection");
    if (isCaller) {
      console.log("📞 Reinitializing call as caller");
      await startCall();
    } else {
      deletePeerConnection();
    }
  };

  const hangUp = async () => {
    deletePeerConnection();
    console.log("📞 Call ended and resources released");
  }

  useEffect(() => {
    startCall();
    socket!.on('webrtc-offer', handleOffer);
    socket!.on('webrtc-answer', handleAnswer);
    socket!.on('webrtc-ice-candidate', handleCandidate);
    socket!.on('reconnect-needed', handleReconnectNeeded);


    return () => {
      socket!.off('webrtc-offer', handleOffer);
      socket!.off('webrtc-answer', handleAnswer);
      socket!.off('webrtc-ice-candidate', handleCandidate);
      socket!.off('reconnect-needed', handleReconnectNeeded);
      deletePeerConnection()
    };
  }, [socket, remoteUserId, localUserId]);
  
  if (!socket || !remoteUserId || !localUserId) {
    console.error("❌ Missing socket or user IDs");
    return {
      localStream: null,
      remoteStream: null,
      toggleMicrophone: () => console.warn("⚠️ Cannot toggle microphone: missing socket or user IDs"),
      micOn: false,
      hangUp: () => console.warn("⚠️ Hangup not implemented yet")
    };
  }
  
  return {
    localStream,
    remoteStream,
    toggleMicrophone,
    micOn,
    hangUp
  };
}
