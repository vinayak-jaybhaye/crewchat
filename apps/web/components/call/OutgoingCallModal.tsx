"use client";

import { Call } from "@/store/call.store";
import { useSocket } from "@/components/providers/SocketProvider";
import { useUserStore } from "@/store/user.store";
import { ProfilePic } from "@/components/user";

export default function OutgoingCallModal({ call }: { call: Call }) {
  const { endCall } = useSocket();
  const callee = useUserStore((state) => state.getUserById(call.calleeId));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-80 text-center">
        <h2 className="text-lg font-semibold mb-2">
          Calling…
        </h2>
        <ProfilePic src={callee?.avatarUrl} name={callee?.username || "U"} size={64} />
        <p>
          To {callee?.username || call.calleeId}
        </p>

        <p className="text-sm text-zinc-400 mb-6">
          {call.type === "VIDEO" ? "Video" : "Voice"} call
        </p>

        <button
          onClick={() => endCall({ callId: call.callId })}
          className="bg-red-600 w-full py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
