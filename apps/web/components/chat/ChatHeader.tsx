"use client";

import React from "react";
import Link from "next/link";
import { MinimalChatPreviewDTO } from "@/lib/types/chat.types";
import { ArrowLeft, Info, Phone, Search } from "lucide-react";
import { ProfilePic } from "@/components/user";

interface chatHeaderParams {
  chat: MinimalChatPreviewDTO,
  setIsAboutChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatHeader({ chat, setIsAboutChatOpen }: chatHeaderParams) {
  // loading state
  if (!chat) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-surface-default border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-bg-muted animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-28 bg-bg-muted rounded-md animate-pulse" />
            <div className="h-3 w-16 bg-bg-muted/60 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-default border-b border-border-subtle shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* back button */}
        <Link href="/chats" className="md:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-subtle transition-all">
          <ArrowLeft className="size-5" />
        </Link>

        <button
          onClick={() => setIsAboutChatOpen(prev => !prev)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
        >
          <ProfilePic size={40} src={chat.imageUrl} name={chat.name} />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
              {chat.name}
            </h2>
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" />
              Online
            </p>
          </div>
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-all cursor-pointer"
          title="Voice call"
        >
          <Phone size={18} />
        </button>
        <button
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-all cursor-pointer"
          title="Search messages"
        >
          <Search size={18} />
        </button>
        <button
          onClick={() => setIsAboutChatOpen(prev => !prev)}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-all cursor-pointer"
          title="Chat details"
        >
          <Info size={18} />
        </button>
      </div>
    </div>
  )
}