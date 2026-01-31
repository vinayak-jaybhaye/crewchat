"use client";

import { MessageCircle, Phone, Video } from "lucide-react";
import { ProfilePic } from "@/components/user"
import { useSocket } from "@/components/providers/SocketProvider";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export default function UserPreview({ user, onDM }: { user: User; onDM: () => void }) {
  const { startCall } = useSocket();

  function handleStartVoiceCall() {
    console.log("Starting voice call to", user.id);
    startCall({ calleeId: user.id, type: "VOICE" });
  }

  function handleStartVideoCall() {
    console.log("Starting video call to", user.id);
    startCall({ calleeId: user.id, type: "VIDEO" });
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      {/* Top section */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <ProfilePic size={64} src={user.avatarUrl} name={user.username} />

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold truncate">
            {user.username}
          </p>
          <p className="text-sm text-neutral-400 truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onDM}
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-sm transition"
        >
          <MessageCircle size={16} />
          DM
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-sm transition"
          onClick={handleStartVoiceCall}
        >
          <Phone size={16} />
          Call
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-sm transition"
          onClick={handleStartVideoCall}
        >
          <Video size={16} />
          Video
        </button>
      </div>
    </div>
  );
}
