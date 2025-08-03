'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { requestCameraAccess, requestCameraAndMicrophoneAccess } from '@/lib/permissions/media';

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
    if (!socket || !remoteUserId || !localUserId) {
        console.error("❌ Missing socket or user IDs");
        return {
            startCall: () => console.warn("⚠️ Cannot start call: missing socket or user IDs"),
            localStream: null,
            remoteStream: null,
            localScreenStream: null,
            remoteScreenStream: null,
            toggleCamera: () => console.warn("⚠️ Cannot toggle camera: missing socket or user IDs"),
            toggleMicrophone: () => console.warn("⚠️ Cannot toggle microphone: missing socket or user IDs"),
            toggleScreenShare: () => console.warn("⚠️ Cannot toggle screen share: missing socket or user IDs"),
            micOn: false,
            cameraOn: false,
            screenShareOn: false,
            hangUp: () => console.warn("⚠️ Hangup not implemented yet")
        };
    }

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
    const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const remoteScreenStreamRef = useRef<MediaStream | null>(null);

    const videoTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
    const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
    const screenTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
    const screenAudioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);

    const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);
    const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);
    const [connectionStarted, setConnectionStarted] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [screenShareOn, setScreenShareOn] = useState(false);
    const [isOfferer, setIsOfferer] = useState(isCaller);

    function createBlankVideoTrack(): MediaStreamTrack {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return canvas.captureStream().getVideoTracks()[0];
    }

    const toggleCamera = async () => {
        if (!localStreamRef.current) {
            localStreamRef.current = new MediaStream();
        }

        const videoTracks = localStreamRef.current.getVideoTracks();

        if (cameraOn) {
            // Turn camera OFF and release hardware
            console.log("📸 Turning camera OFF and releasing hardware...");

            videoTracks.forEach(track => {
                track.enabled = false; // Disable the track
                track.stop(); // This releases the hardware
                localStreamRef.current?.removeTrack(track); // Remove from stream
            });

            // Remove video track from transceiver (stop sending video)
            await videoTransceiverRef.current?.sender.replaceTrack(createBlankVideoTrack());

            // Update the local stream state
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

            setCameraOn(localStreamRef.current.getVideoTracks().length > 0);
            console.log("📸 Camera turned OFF, hardware released");

        } else {
            // Turn camera ON - need to request new hardware access
            console.log("📸 Turning camera ON, requesting hardware access...");

            try {
                const granted = await requestCameraAccess();
                if (!granted) {
                    console.warn("❗ Camera access denied");
                    return;
                }

                // Get new camera stream (since we released hardware)
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const videoTrack = videoStream.getVideoTracks()[0];

                if (videoTrack) {
                    // Add new video track to local stream
                    localStreamRef.current.addTrack(videoTrack);
                    setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

                    // Add video track to transceiver
                    await videoTransceiverRef.current?.sender.replaceTrack(videoTrack);

                    setCameraOn(localStreamRef.current.getVideoTracks().length > 0);
                    console.log("📸 Camera turned ON, hardware acquired");
                }
            } catch (error) {
                console.warn("❌ Error accessing camera:", error);
                await videoTransceiverRef.current?.sender.replaceTrack(createBlankVideoTrack());
                setCameraOn(false);
            }
        }
    };

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

    const toggleScreenShare = async () => {
        const screenTransceiver = screenTransceiverRef.current;

        if (!screenTransceiver) {
            console.warn("❗ Screen transceiver not initialized");
            return;
        }

        if (screenShareOn) {
            console.log("🖥️ Stopping screen share");

            // Stop and cleanup video track
            const videoTrack = screenTransceiver.sender.track;
            if (videoTrack) {
                videoTrack.stop();
            }
            await screenTransceiver.sender.replaceTrack(createBlankVideoTrack());

            // Stop and cleanup audio track
            const audioTransceiver = screenAudioTransceiverRef.current;
            if (audioTransceiver?.sender.track) {
                audioTransceiver.sender.track.stop();
                await audioTransceiver.sender.replaceTrack(null);
            }

            // Update state
            setLocalScreenStream(null);
            setScreenShareOn(false);
            return;
        }

        try {
            console.log("🖥️ Starting screen share");
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const screenTrack = screenStream.getVideoTracks()[0];
            const audioTrack = screenStream.getAudioTracks()[0];

            if (!screenTrack) {
                throw new Error("No screen track found");
            }

            // Replace video track
            await screenTransceiver.sender.replaceTrack(screenTrack);

            // Replace audio track if available
            if (audioTrack && screenAudioTransceiverRef.current) {
                await screenAudioTransceiverRef.current.sender.replaceTrack(audioTrack);
            }

            console.log("🎥 Screen track added to transceiver:", screenTrack.id);
            if (audioTrack) {
                console.log("🎵 Screen audio track added:", audioTrack.id);
            }

            // Update state
            setScreenShareOn(true);
            setLocalScreenStream(screenStream);

            // Handle user stopping share via browser UI
            const handleScreenShareEnd = async () => {
                console.log("🛑 Screen share ended by user");

                // Clean up transceivers
                await screenTransceiver.sender.replaceTrack(createBlankVideoTrack());
                if (screenAudioTransceiverRef.current) {
                    await screenAudioTransceiverRef.current.sender.replaceTrack(null);
                }

                // Update state
                setScreenShareOn(false);
                setLocalScreenStream(null);
            };

            // Listen for track ending (user clicks "Stop sharing" in browser)
            screenTrack.onended = handleScreenShareEnd;
            if (audioTrack) {
                audioTrack.onended = handleScreenShareEnd;
            }

        } catch (error) {
            console.warn("❌ Error starting screen share:", error);

            // Ensure state is consistent
            setScreenShareOn(false);
            setLocalScreenStream(null);
        }
    };
    // Make sure to properly clean up and recreate transceivers
    const deletePeerConnection = () => {
        if (peerConnectionRef.current) {
            console.log("🗑️ Deleting peer connection");

            if (localStreamRef.current) {
                const tracks = localStreamRef.current.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    localStreamRef.current?.removeTrack(track);
                })
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
            setLocalScreenStream(null);
            setRemoteScreenStream(null);
            localStreamRef.current = null;
            remoteStreamRef.current = null;

            // IMPORTANT: Clear transceiver refs to ensure clean state
            videoTransceiverRef.current = null;
            audioTransceiverRef.current = null;
            screenTransceiverRef.current = null;
            screenAudioTransceiverRef.current = null;

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

        const videoTsc = pc.addTransceiver("video", { direction: "sendrecv" });
        const audioTsc = pc.addTransceiver("audio", { direction: "sendrecv" });
        const screenTsc = pc.addTransceiver("video", { direction: "sendrecv" });
        const screenAudioTsc = pc.addTransceiver("audio", { direction: "sendrecv" });

        videoTransceiverRef.current = videoTsc;
        audioTransceiverRef.current = audioTsc;
        screenTransceiverRef.current = screenTsc;
        screenAudioTransceiverRef.current = screenAudioTsc;

        console.log("🔁 Transceivers created:", { video: videoTsc, audio: audioTsc });

        try {
            // Request microphone and camera access
            const mediaAccessGranted = await requestCameraAndMicrophoneAccess();
            if (!mediaAccessGranted) {
                console.warn("❗ Media access denied");
                await videoTransceiverRef.current?.sender.replaceTrack(createBlankVideoTrack());
                await audioTransceiverRef.current?.sender.replaceTrack(null);
            } else {
                toggleCamera();
                toggleMicrophone();
            }
        } catch (error) {
            console.error("❌ Error getting local media:", error);
        }
        // await screenTsc.sender.replaceTrack(null);
        // await screenAudioTsc.sender.replaceTrack(null);

        const midMap: Record<string, 'video' | 'audio' | 'screen' | 'screenaudio'> = {
            '0': 'video',
            '1': 'audio',
            '2': 'screen',
            '3': 'screenaudio',
            '4': 'video',
            '5': 'audio',
            '6': 'screen',
            '7': 'screenaudio',
        };

        pc.ontrack = (event) => {
            const track = event.track;
            const kind = track.kind;
            const label = track.label;
            const mid = event.transceiver?.mid;

            console.log("📥 Received remote track:", kind, label, "MID:", mid);

            if (!mid) {
                console.warn("❗ Track received without MID");
                return;
            }

            const type = midMap[mid] || 'unknown';

            // Screen share (video with screen in label or via midMap)
            if (type === 'screen' || type == 'screenaudio' || (kind === 'video' && label.includes('screen'))) {
                console.log("🖥️ Adding screen share track:", type);
                if (!remoteScreenStreamRef.current) {
                    remoteScreenStreamRef.current = new MediaStream();
                }
                remoteScreenStreamRef.current.addTrack(track);
                setRemoteScreenStream(remoteScreenStreamRef.current);
                return;
            }

            // Main remote stream (video or audio)
            if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
            }
            remoteStreamRef.current.addTrack(track);
            setRemoteStream(remoteStreamRef.current);
            console.log("Remote media set");
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

    return {
        startCall,
        localStream,
        remoteStream,
        localScreenStream,
        remoteScreenStream,
        toggleCamera,
        toggleMicrophone,
        toggleScreenShare,
        micOn,
        cameraOn,
        screenShareOn,
        hangUp
    };
}
