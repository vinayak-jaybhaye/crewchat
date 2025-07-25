'use client'

import { useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

interface AudioCallWindowProps {
    socket: any;
    remoteUserId: string;
    localUserId: string;
    caller: string;
    DeleteCall: () => void;
}

export function AudioCallWindow({ socket, remoteUserId, localUserId, caller, DeleteCall }: AudioCallWindowProps) {
    const localRef = useRef<HTMLAudioElement | null>(null);
    const remoteRef = useRef<HTMLAudioElement | null>(null);

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

    const pauseMediaStreams = () => {
        if (localRef.current) {
            localRef.current.pause();
            localRef.current.srcObject = null;
        }
        if (remoteRef.current) {
            remoteRef.current.pause();
            remoteRef.current.srcObject = null;
        }
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
        if (localUserId === caller) init();

        return hangUp;
    }, [remoteUserId, localUserId]);

    // useEffect(() => {
    //     if (localRef.current && localStream) {
    //         localRef.current.srcObject = localStream;
    //         localRef.current.play().catch((err) => console.warn("Local audio play error:", err));
    //     }
    // }, [localStream]);

    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream;
            remoteRef.current.play().catch((err) => console.warn("Remote audio play error:", err));
        }
    }, [remoteStream]);

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

    const handleEndCall = () => {
        pauseMediaStreams();
        hangUp();
        DeleteCall();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 text-white flex flex-col items-center justify-center gap-6 z-50">
            <div className="text-center">
                <h2 className="text-xl font-semibold">Audio Call</h2>
                <p className="text-sm text-gray-300">You're on a voice call with {remoteUserId}</p>
            </div>

            <div className="hidden">
                <audio ref={localRef} autoPlay muted />
                <audio ref={remoteRef} autoPlay />
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
