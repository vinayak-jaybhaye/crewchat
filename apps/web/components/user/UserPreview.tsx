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
    <div className="w-full max-w-md mx-auto rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      {/* Top section */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <ProfilePic size={64} src={user.avatarUrl} name={user.username} />

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary truncate">
            {user.username}
          </p>
          <p className="text-sm text-text-muted truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onDM}
          className="flex items-center justify-center gap-2 rounded-xl bg-bg-muted hover:bg-bg-subtle px-3 py-2.5 text-sm text-text-primary font-medium transition-all hover:scale-[0.98] active:scale-95 cursor-pointer"
        >
          <MessageCircle size={16} />
          DM
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-bg-muted hover:bg-bg-subtle px-3 py-2.5 text-sm text-text-primary font-medium transition-all hover:scale-[0.98] active:scale-95 cursor-pointer"
          onClick={handleStartVoiceCall}
        >
          <Phone size={16} />
          Call
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-bg-muted hover:bg-bg-subtle px-3 py-2.5 text-sm text-text-primary font-medium transition-all hover:scale-[0.98] active:scale-95 cursor-pointer"
          onClick={handleStartVideoCall}
        >
          <Video size={16} />
          Video
        </button>
      </div>
    </div>
  );
}
