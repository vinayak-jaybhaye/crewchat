'use client'

import { useEffect, useRef } from "react";
import { useStream } from "@/hooks/useStream";

interface CallProps {
    socket: any;
    remoteUserId: string;
    localUserId: string;
    caller: string;
    DeleteCall: () => void;
}

export function Call({
    socket,
    remoteUserId,
    localUserId,
    DeleteCall,
    caller
}: CallProps) {
    const remoteCameraRef = useRef<HTMLVideoElement | null>(null);
    const remoteScreenRef = useRef<HTMLVideoElement | null>(null);
    const localCameraRef = useRef<HTMLVideoElement | null>(null);
    const localScreenRef = useRef<HTMLVideoElement | null>(null);
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    if (!socket || !remoteUserId || !localUserId) {
        console.error("Call requires socket, remoteUserId, and localUserId");
        return null;
    }

    const {
        hangUp,
        startCall,
        localCamera,
        localAudio,
        localScreen,
        remoteAudio,
        remoteCamera,
        remoteScreen,
        toggleCamera,
        toggleMic,
        toggleScreenShare
    } = useStream({ socket, remoteUserId, localUserId, callType: 'video' });

    if (localCamera) console.log("localCamera :: active");
    if (localScreen) console.log("localScreen :: active");
    if (localAudio) console.log("localAudio :: active");
    if (remoteCamera) console.log("remoteCamera :: active");
    if (remoteScreen) console.log("remoteScreen :: active");
    if (remoteAudio) console.log("remoteAudio :: active");


    const pauseMediaStreams = () => {
        const refs = [
            localCameraRef,
            remoteCameraRef,
            localScreenRef,
            remoteScreenRef,
        ];
        for (const ref of refs) {
            if (ref.current) {
                ref.current.pause();
                ref.current.srcObject = null;
            }
        }
        if (localAudioRef.current) localAudioRef.current.srcObject = null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    };

    useEffect(() => {
        const init = async () => {
            try {
                await startCall();
            } catch (err) {
                console.error("Error starting call:", err);
            }
        };

        socket.on('reconnect-needed', () => {
            if (caller === localUserId) init();
        });

        if (localUserId === caller) init();

        return () => {
            socket.off('reconnect-needed');
            hangUp();
            pauseMediaStreams();
        };
    }, [remoteUserId, localUserId]);

    // Local Media
    useEffect(() => {
        if (localCameraRef.current && localCamera)
            localCameraRef.current.srcObject = localCamera;

        if (localScreenRef.current && localScreen)
            localScreenRef.current.srcObject = localScreen;

        if (localAudioRef.current && localAudio)
            localAudioRef.current.srcObject = localAudio;

        console.log("<====================================>");
        if (localAudio) console.log("Local audio :: active", localAudio);
        if (localCamera) console.log("Local camera :: active", localCamera);
        if (localScreen) console.log("Local screen :: active", localScreen);
    }, [localCamera, localScreen, localAudio]);

    // Remote Media
    useEffect(() => {
        if (remoteCameraRef.current && remoteCamera)
            remoteCameraRef.current.srcObject = remoteCamera;

        if (remoteScreenRef.current && remoteScreen)
            remoteScreenRef.current.srcObject = remoteScreen;

        if (remoteAudioRef.current && remoteAudio)
            remoteAudioRef.current.srcObject = remoteAudio;

        console.log("<====================================>");
        if (remoteAudio) console.log("Remote audio :: active", remoteAudio);
        if (remoteCamera) console.log("Remote camera :: active", remoteCamera);
        if (remoteScreen) console.log("Remote screen :: active", remoteScreen);
    }, [remoteCamera, remoteScreen, remoteAudio]);

    useEffect(() => {
        if (remoteCameraRef.current && remoteCamera) {
            remoteCameraRef.current.srcObject = remoteCamera;

            remoteCameraRef.current.onloadedmetadata = () => {
                console.log("Remote camera metadata loaded");
                remoteCameraRef.current?.play().catch(err => {
                    console.error("Error playing remote camera:", err);
                });
            };

            const tracks = remoteCamera.getVideoTracks();
            if (tracks.length > 0) {
                console.log("Remote camera video track state:", {
                    enabled: tracks[0].enabled,
                    readyState: tracks[0].readyState
                });
            } else {
                console.warn("No video tracks in remoteCamera");
            }
        }
    }, [remoteCamera]);

    const handleEndCall = () => {
        pauseMediaStreams();
        hangUp();
        DeleteCall();
    };

    return (
        <div className="relative w-full h-full bg-black text-white flex flex-col items-center justify-between p-4 gap-4">
            {/* Remote Media */}
            <div className="flex flex-wrap justify-center items-center gap-4">
                <video
                    ref={remoteCameraRef}
                    autoPlay
                    playsInline
                    className="w-72 h-48 rounded-lg border"
                />
                <video
                    ref={remoteScreenRef}
                    autoPlay
                    playsInline
                    className="w-72 h-48 rounded-lg border"
                />
                <audio ref={remoteAudioRef} autoPlay />
            </div>

            {/* Local Media */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-gray-800 p-2 rounded-lg shadow-lg">
                <video
                    ref={localCameraRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-32 h-20 rounded border"
                />
                <video
                    ref={localScreenRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-32 h-20 rounded border"
                />
                <audio ref={localAudioRef} autoPlay muted />
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center items-center mt-4">
                <button
                    onClick={toggleScreenShare}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Toggle Screen
                </button>
                <button
                    onClick={toggleMic}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                    Toggle Mic
                </button>
                <button
                    onClick={toggleCamera}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                    Toggle Camera
                </button>
                <button
                    onClick={handleEndCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                    End Call
                </button>
            </div>
        </div>
    );
}
