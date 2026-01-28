"use client";

import { MessageCircle, Phone, Video } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export default function UserPreview({ user, onDM }: { user: User; onDM: () => void }) {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      {/* Top section */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-xl font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}

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
        >
          <Phone size={16} />
          Call
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3 py-2 text-sm transition"
        >
          <Video size={16} />
          Video
        </button>
      </div>
    </div>
  );
}
