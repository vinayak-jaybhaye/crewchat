'use client';

import { useSession } from "next-auth/react";
import { useGlobalSocket } from '@/context/SocketProvider';
import { PhoneCall, Video } from 'lucide-react'

export interface CallPayload {
    callId?: string;
    caller: string;
    callee: string;
    status: "calling" | "incoming" | "accepted" | "rejected" | "ended";
    type: "video" | "audio";
    startedAt?: number;
    endedAt?: number;
    disconnectedUsers?: string[];
}

function CallButton({ userId }: { userId: string }) {
    // Receiver is userId
    const { data: session } = useSession();
    const socket = useGlobalSocket();

    const inCall = false;

    if (!session?.user?._id || !socket) return null;

    const handleCall = (callType: "video" | "audio") => {
        const callerId = session.user._id;
        const callData = {
            caller: callerId,
            other: userId,
            type: callType,
        };

        socket.emit("call", callData);

        console.log("CallButton :: Initiated call:", callData);
    };

    if (userId == session.user._id) return null;

    return (
        <div className="flex gap-4">
            <button
                title="Video Call"
                disabled={inCall}
                onClick={() => handleCall("video")}
                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer
          ${inCall
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"}
        `}
            >
                <Video />
            </button>
            <button
                title="Audio Call"
                disabled={inCall}
                onClick={() => handleCall("audio")}
                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer
          ${inCall
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"}
        `}
            >
                <PhoneCall />
            </button>
        </div>
    );
}

export default CallButton;
