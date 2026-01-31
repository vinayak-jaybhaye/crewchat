"use client";

import { Phone, Mic, MicOff, Maximize2 } from "lucide-react";
import ProfilePic from "@/components/user/ProfilePic";

interface CallBarProps {
  username: string;
  avatarUrl?: string | null;
  duration: string;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  onExpand: () => void;
  onEnd: () => void;
}

export function CallBar({
  username,
  avatarUrl,
  duration,
  isAudioEnabled,
  toggleAudio,
  onExpand,
  onEnd,
}: CallBarProps) {
  return (
    <div className=" bg-zinc-900 border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: user info */}
        <div className="flex items-center gap-3">
          <ProfilePic src={avatarUrl} name={username} size={32} />
          <div className="flex flex-col">
            <span className="hidden md:block font-medium text-white">
              {username}
            </span>
          </div>
        </div>
        <span className="font-bold text-white">
          {duration}
        </span>
        {/* Right: controls */}
        <div className="flex  text-white items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full ${isAudioEnabled ? "bg-zinc-700" : "bg-red-600"
              }`}
          >
            {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button
            onClick={onEnd}
            className="p-2 rounded-full bg-red-600"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={onExpand}
            className="p-2 rounded-full bg-zinc-700"
          >
            <Maximize2 size={16} />
          </button>


        </div>
      </div>
    </div>
  );
}
