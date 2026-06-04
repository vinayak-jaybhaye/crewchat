"use client";

import { useRef, useEffect } from "react";
import { Pin, PinOff, Bell, BellOff, CheckCircle } from "lucide-react";
import { togglePinAction, toggleMuteAction, markChatAsReadAction } from "@/lib/actions/chat.actions";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat.store";

interface ChatOptionsProps {
  chatId: string;
  pinned: boolean;
  muted: boolean;
  unreadCount: number;
  setChatOptionsOpen: (chatId: string | null) => void;
}

export default function ChatOptions({ chatId, pinned, muted, unreadCount, setChatOptionsOpen }: ChatOptionsProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setChatOptionsOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (action: () => Promise<unknown>, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatOptionsOpen(null);
    await action();
    router.refresh();
  };

  const handleToggleMute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatOptionsOpen(null);
    try {
      await toggleMuteAction(chatId, !muted);
      useChatStore.getState().setMuted(chatId, !muted);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle mute", error);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChatOptionsOpen(null);
    try {
      await togglePinAction(chatId, !pinned);
      useChatStore.getState().setPinned(chatId, !pinned);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle pin", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="absolute right-0 top-8 w-48 bg-surface-raised border border-border-subtle rounded-lg shadow-xl z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col py-1">
          <button
            onClick={(e) => handleAction(() => handleTogglePin(e), e)}
            className="px-4 py-2.5 text-sm text-left text-text-primary hover:bg-bg-muted hover:text-accent-primary flex items-center gap-3 transition-colors"
          >
            {pinned ? <PinOff size={16} /> : <Pin size={16} />}
            {pinned ? "Unpin chat" : "Pin chat"}
          </button>

          <button
            onClick={(e) => handleAction(() => handleToggleMute(e), e)}
            className="px-4 py-2.5 text-sm text-left text-text-primary hover:bg-bg-muted hover:text-accent-secondary flex items-center gap-3 transition-colors"
          >
            {muted ? <Bell size={16} /> : <BellOff size={16} />}
            {muted ? "Unmute chat" : "Mute chat"}
          </button>

          <button
            onClick={(e) => handleAction(() => markChatAsReadAction(chatId), e)}
            className="px-4 py-2.5 text-sm text-left text-text-primary hover:bg-bg-muted hover:text-accent-tertiary flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={unreadCount === 0}
          >
            <CheckCircle size={16} className={unreadCount === 0 ? "opacity-50" : ""} />
            <span className={unreadCount === 0 ? "opacity-50" : ""}>Mark as read</span>
          </button>
        </div>
      </div>
    </div>
  );
}