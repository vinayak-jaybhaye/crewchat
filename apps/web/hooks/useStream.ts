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

export function useStream({
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

    // Local media streams
    const [localCamera, setLocalCamera] = useState<MediaStream | null>(null);
    const [localAudio, setLocalAudio] = useState<MediaStream | null>(null);
    const [localScreen, setLocalScreen] = useState<MediaStream | null>(null);

    // Remote media streams
    const [remoteCamera, setRemoteCamera] = useState<MediaStream | null>(null);
    const [remoteAudio, setRemoteAudio] = useState<MediaStream | null>(null);
    const [remoteScreen, setRemoteScreen] = useState<MediaStream | null>(null);

    // Device states
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isSharingScreen, setIsSharingScreen] = useState(false);

    // Refs
    const videoSenderRef = useRef<RTCRtpSender | null>(null);
    const audioSenderRef = useRef<RTCRtpSender | null>(null);
    const screenSenderRef = useRef<RTCRtpSender | null>(null);

    const audioTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
    const videoTransceiverRef = useRef<RTCRtpTransceiver | null>(null);
    const screenTransceiverRef = useRef<RTCRtpTransceiver | null>(null);

    const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);

    const remoteDescriptionSet = useRef(false);

    // Media permission handling
    const getMediaStream = async () => {
        try {
            const allowed = callType === 'video'
                ? await requestCameraAndMicrophoneAccess()
                : await requestMicrophoneAccess();

            if (!allowed) return null;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true,
            });

            if (callType === 'video') {
                setLocalCamera(new MediaStream(stream.getVideoTracks()));
            }
            setLocalAudio(new MediaStream(stream.getAudioTracks()));

            return stream;
        } catch (error) {
            console.error('Error getting media stream:', error);
            return null;
        }
    };

    // Cleanup resources
    const releaseMediaStream = () => {
        setLocalCamera(null);
        setLocalAudio(null);
        setLocalScreen(null);
        setRemoteAudio(null);
        setRemoteCamera(null);
        setRemoteScreen(null);

        setIsMicMuted(false);
        setIsCameraOff(false);
        setIsSharingScreen(false);
    };

    // Close peer connection
    const closePeerConnection = () => {
        if (peerConnection.current) {
            peerConnection.current.onicecandidate = null;
            peerConnection.current.ontrack = null;
            peerConnection.current.onconnectionstatechange = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }
        remoteDescriptionSet.current = false;
        iceCandidateQueue.current = [];
        releaseMediaStream();
    };

    const getInitialMedia = async () => {
        console.log("Getting initial media...");
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

            const audioTrack = audioStream.getAudioTracks()[0];
            const videoTrack = videoStream.getVideoTracks()[0];

            setLocalAudio(new MediaStream([audioTrack]));
            setLocalCamera(new MediaStream([videoTrack]));

            audioSenderRef.current?.replaceTrack(audioTrack);
            videoSenderRef.current?.replaceTrack(videoTrack);
            console.log("Initial media set:");
        } catch (error) {
            console.error('Error getting initial media:', error);
            // Handle error appropriately, e.g., show a notification to the user
        }
    };


    // Microphone toggle
    const toggleMic = async () => {
        try {
            const sender = audioSenderRef.current;
            if (!sender) return;

            if (isMicMuted) {
                // Turn on mic
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const newAudioTrack = audioStream.getAudioTracks()[0];
                sender.replaceTrack(newAudioTrack);

                setLocalAudio(new MediaStream([newAudioTrack]));

                // Cleanup unused tracks
                audioStream.getTracks()
                    .filter(t => t !== newAudioTrack)
                    .forEach(t => t.stop());
            } else {
                // Turn off mic
                const currentTrack = sender.track;
                sender.replaceTrack(null);
                setLocalAudio(null);
                currentTrack?.stop();
            }
            setIsMicMuted(!isMicMuted);
        } catch (error) {
            console.error('Error toggling microphone:', error);
        }
    };

    // Camera toggle
    const toggleCamera = async () => {
        try {
            const sender = videoSenderRef.current;
            if (!sender) return;

            if (isCameraOff) {
                // Turn on camera
                const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = videoStream.getVideoTracks()[0];
                sender.replaceTrack(newVideoTrack);

                setLocalCamera(new MediaStream([newVideoTrack]));

                // Cleanup unused tracks
                videoStream.getTracks()
                    .filter(t => t !== newVideoTrack)
                    .forEach(t => t.stop());
            } else {
                // Turn off camera
                const currentTrack = sender.track;
                sender.replaceTrack(null);

                setLocalCamera(null);

                currentTrack?.stop();
            }
            setIsCameraOff(!isCameraOff);
        } catch (error) {
            console.error('Error toggling camera:', error);
        }
    };

    // Then in toggleScreenShare:
    const toggleScreenShare = async () => {
        try {
            const sender = screenSenderRef.current;
            console.log(sender)
            if (!sender) return;

            if (isSharingScreen) {
                // Stop screen share - just replace with null
                const currentTrack = sender.track;
                sender.replaceTrack(null);
                setLocalScreen(null);
                currentTrack?.stop();
            } else {
                // Start screen share
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false
                });

                screenStream.getTracks().forEach(track => {
                    track.onended = () => {
                        if (isSharingScreen) toggleScreenShare();
                    };
                });

                const screenTrack = screenStream.getVideoTracks()[0];
                sender.replaceTrack(screenTrack);
                setLocalScreen(new MediaStream([screenTrack]));
            }
            setIsSharingScreen(!isSharingScreen);
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    };

    // Initiate call
    const startCall = useCallback(async () => {
        if (!socket || !localUserId || !remoteUserId) return;
        closePeerConnection();

        try {
            const pc = new RTCPeerConnection(configuration);
            peerConnection.current = pc;

            const localMedia = await getMediaStream();
            if (!localMedia) {
                closePeerConnection();
                return;
            }

            if (pc.signalingState === 'closed') return;

            const tempTransceivers: { transceiver: RTCRtpTransceiver; role: 'audio' | 'camera' | 'screen' }[] = [];

            const audioTransceiver = pc.addTransceiver(localMedia.getAudioTracks()[0], { direction: 'sendrecv' });
            const videoTransceiver = pc.addTransceiver(localMedia.getVideoTracks()[0], { direction: 'sendrecv' });
            // const screenTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });

            audioSenderRef.current = audioTransceiver.sender;
            videoSenderRef.current = videoTransceiver.sender;
            // screenSenderRef.current = screenTransceiver.sender;

            audioTransceiverRef.current = audioTransceiver;
            videoTransceiverRef.current = videoTransceiver;

            tempTransceivers.push({ transceiver: audioTransceiver, role: 'audio' });
            tempTransceivers.push({ transceiver: videoTransceiver, role: 'camera' });
            // tempTransceivers.push({ transceiver: screenTransceiver, role: 'screen' });

            // await getInitialMedia();

            const roles: ('audio' | 'camera' | 'screen')[] = ['audio', 'camera', 'screen'];

            // ICE candidate handling
            pc.onicecandidate = (event) => {
                if (event.candidate && socket && peerConnection.current?.connectionState !== 'closed') {
                    socket.emit('webrtc-ice-candidate', {
                        from: localUserId,
                        to: remoteUserId,
                        candidate: event.candidate,
                    });
                }
            };

            // Connection state
            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    closePeerConnection();
                }
            };

            const midMap: Record<string, 'camera' | 'screen' | 'audio'> = { '0': 'audio', '1': 'camera', '2': 'screen' };
            pc.ontrack = (event) => {
                console.log("INSIDE ONTRACK")
                const track = event.track;
                const mid = event.transceiver?.mid;

                if (!mid) return;

                const role = midMap[mid]; // This should be available from earlier in startCall
                if (!role) {
                    console.warn("Unknown role for mid:", mid);
                    return;
                }

                const stream = new MediaStream([track]);
                if (role === 'audio') setRemoteAudio(stream);
                else if (role === 'camera') setRemoteCamera(stream);
                else if (role === 'screen') setRemoteScreen(stream);
            };


            //  Create and set local offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await new Promise((res) => setTimeout(res, 100));


            // Now extract mids
            tempTransceivers.forEach(({ transceiver, role }) => {
                if (transceiver.mid) {
                    midMap[transceiver.mid] = role;
                } else {
                    console.warn('Transceiver MID missing for:', role);
                }
            });

            // Send offer with mids
            socket.emit('webrtc-offer', {
                from: localUserId,
                to: remoteUserId,
                offer,
                midMap,
            });

        } catch (error) {
            console.error('Error starting call:', error);
            closePeerConnection();
        }
    }, [socket, localUserId, remoteUserId, callType]);


    // Socket event handlers
    useEffect(() => {
        if (!socket || !localUserId) return;

        const handleOffer = async (data: {
            from: string;
            to: string;
            offer: RTCSessionDescriptionInit;
            midMap: Record<string, 'camera' | 'screen' | 'audio'>;
        }) => {
            const { from, to, offer, midMap: senderMidMap } = data;
            if (to !== localUserId) return;
            console.log(senderMidMap)
            console.log("offer received from:", offer);

            closePeerConnection();

            try {
                const pc = new RTCPeerConnection(configuration);
                peerConnection.current = pc;

                // Attach local media to correct transceivers
                const localMedia = await getMediaStream();
                if (!localMedia) {
                    closePeerConnection();
                    console.warn("No local media stream available");
                    return;
                }

                // Pre-create transceivers (so we get mid-matching)
                const tempTransceivers: { transceiver: RTCRtpTransceiver; role: 'audio' | 'camera' | 'screen' }[] = [];

                const audioTransceiver = pc.addTransceiver(localMedia.getAudioTracks()[0], { direction: 'sendrecv' });  // for audio
                const videoTransceiver = pc.addTransceiver(localMedia.getVideoTracks()[0], { direction: 'sendrecv' });  // for camera
                // const screenTransceiver = pc.addTransceiver('video', { direction: 'sendrecv' });  // for screen sharing

                audioSenderRef.current = audioTransceiver.sender;
                videoSenderRef.current = videoTransceiver.sender;
                // screenSenderRef.current = screenTransceiver.sender;
                // await getInitialMedia()

                tempTransceivers.push({ transceiver: audioTransceiver, role: 'audio' });
                tempTransceivers.push({ transceiver: videoTransceiver, role: 'camera' });
                // tempTransceivers.push({ transceiver: screenTransceiver, role: 'screen' });



                // Set ontrack before setting remote description
                pc.ontrack = (event) => {
                    const track = event.track;
                    const mid = event.transceiver?.mid;

                    if (!mid) return;
                    const role = senderMidMap[mid];
                    if (!role) {
                        console.warn("Unknown role for mid:", mid);
                        return;
                    }

                    const stream = new MediaStream([track]);
                    if (role === 'audio') setRemoteAudio(stream);
                    else if (role === 'camera') setRemoteCamera(stream);
                    else if (role === 'screen') setRemoteScreen(stream);
                };

                // ICE handling
                pc.onicecandidate = (event) => {
                    if (event.candidate && socket) {
                        socket.emit('webrtc-ice-candidate', {
                            from: localUserId,
                            to: from,
                            candidate: event.candidate
                        });
                    }
                };

                //  Connection state
                pc.onconnectionstatechange = () => {
                    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                        closePeerConnection();
                    }
                };

                // Set remote description (triggers `ontrack`)
                await pc.setRemoteDescription(offer);
                remoteDescriptionSet.current = true;

                // Create and send answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log("Answer created:", answer);

                const roles: ('audio' | 'camera' | 'screen')[] = ['audio', 'camera', 'screen'];

                socket.emit('webrtc-answer', {
                    from: localUserId,
                    to: from,
                    answer: answer,
                });

            } catch (err) {
                console.error("Error handling offer:", err);
                closePeerConnection();
            }
        };

        const handleAnswer = async (data: {
            from: string;
            to: string;
            answer: RTCSessionDescriptionInit;
        }) => {
            if (data.to !== localUserId || !peerConnection.current) return;
            const { from, answer } = data;
            const pc = peerConnection.current;

            try {
                const midMap: Record<string, 'camera' | 'screen' | 'audio'> = { '0': 'audio', '1': 'camera', '2': 'screen' };
                pc.ontrack = (event) => {
                    const track = event.track;
                    const mid = event.transceiver?.mid;

                    if (!mid) return;
                    const role = midMap[mid];
                    if (!role) {
                        console.warn("Unknown role for mid:", mid);
                        return;
                    }

                    const stream = new MediaStream([track]);
                    if (role === 'audio') setRemoteAudio(stream);
                    else if (role === 'camera') setRemoteCamera(stream);
                    else if (role === 'screen') setRemoteScreen(stream);
                };

                // set remote description
                await pc.setRemoteDescription(answer);
                remoteDescriptionSet.current = true;


                // Handle buffered ICE candidates
                for (const candidate of iceCandidateQueue.current) {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (err) {
                        console.warn("Buffered ICE candidate failed:", err);
                    }
                }
                iceCandidateQueue.current = [];
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        };

        const handleCandidate = async (data: {
            from: string;
            to: string;
            candidate: RTCIceCandidateInit;
        }) => {
            if (data.to !== localUserId || !peerConnection.current) return;
            const pc = peerConnection.current;
            const ice = new RTCIceCandidate(data.candidate);

            if (remoteDescriptionSet.current) {
                try {
                    await pc.addIceCandidate(ice);
                } catch (err) {
                    console.warn("ICE candidate add error:", err);
                }
            } else {
                iceCandidateQueue.current.push(ice);
            }
        };

        // Socket event listeners
        socket.on('webrtc-offer', handleOffer);
        socket.on('webrtc-answer', handleAnswer);
        socket.on('webrtc-ice-candidate', handleCandidate);

        // Cleanup
        return () => {
            socket.off('webrtc-offer', handleOffer);
            socket.off('webrtc-answer', handleAnswer);
            socket.off('webrtc-ice-candidate', handleCandidate);
            closePeerConnection();
        };
    }, [socket, localUserId]);

    // Hang up call
    const hangUp = useCallback(() => {
        if (socket && localUserId && remoteUserId) {
            socket.emit('webrtc-hangup', {
                from: localUserId,
                to: remoteUserId,
            });
        }
        closePeerConnection();
    }, [socket, localUserId, remoteUserId]);

    return {
        startCall,
        hangUp,
        localCamera,
        localAudio,
        localScreen,
        remoteAudio,
        remoteCamera,
        remoteScreen,
        toggleCamera,
        toggleMic,
        toggleScreenShare,
        isMicMuted,
        isCameraOff,
        isSharingScreen
    };
}