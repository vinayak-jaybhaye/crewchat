"use client";

import { Call } from "@/store/call.store";
import { useSocket } from "@/components/providers/SocketProvider";
import { useUserStore } from "@/store/user.store";
import { ProfilePic } from "@/components/user";

export default function IncomingCallModal({ call }: { call: Call }) {
  const { acceptCall, endCall } = useSocket();
  const caller = useUserStore((state) => state.getUserById(call.callerId));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-80 text-center">
        <h2 className="text-lg font-semibold mb-2">
          Incoming {call.type === "VIDEO" ? "Video" : "Voice"} Call
        </h2>

        <ProfilePic src={caller?.avatarUrl} name={caller?.username || "U"} size={64} />
        <p className="text-sm text-zinc-400 mb-6">
          From {caller?.username || call.callerId}
        </p>

        <div className="flex justify-between gap-4">
          <button
            onClick={() => endCall({ callId: call.callId })}
            className="flex-1 bg-red-600 py-2 rounded-lg"
          >
            Reject
          </button>

          <button
            onClick={() => acceptCall({ callId: call.callId })}
            className="flex-1 bg-green-600 py-2 rounded-lg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
