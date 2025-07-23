'use client'

import { useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

interface AudioCallWindowProps {
    socket: any;
    remoteUserId: string;
    localUserId: string;
    DeleteCall?: () => void;
}

export function AudioCallWindow({ socket, remoteUserId, localUserId, DeleteCall }: AudioCallWindowProps) {
    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    if (!socket || !remoteUserId || !localUserId) {
        console.error("AudioCallWindow requires socket, remoteUserId, and localUserId");
        return null;
    }

    const { localStream, remoteStream, hangUp, startCall } = useWebRTC({
        socket,
        remoteUserId,
        localUserId,
        callType: 'audio',
    });

    useEffect(() => {
        if (localAudioRef.current && localStream) {
            localAudioRef.current.srcObject = localStream;
            localAudioRef.current.play().catch((err) => console.warn("Local audio play error:", err));
        }

        if (remoteAudioRef.current && remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch((err) => console.warn("Remote audio play error:", err));
        }
    }, [localStream, remoteStream]);

    const handleEndCall = () => {
        if (DeleteCall) {
            DeleteCall();
        } else {
            hangUp();
        }
        console.log("Audio call ended by user");
    };

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 text-white flex flex-col items-center justify-center gap-6 z-50">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Audio Call</h2>
                <p className="text-sm text-gray-300">You're on a voice call with {remoteUserId}</p>
            </div>

            <div className="hidden">
                <audio ref={localAudioRef} autoPlay muted />
                <audio ref={remoteAudioRef} autoPlay />
            </div>

            <button
                onClick={handleEndCall}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
            >
                End Call
            </button>
        </div>
    );
}
