"use client";

import { useLongPress } from "@/hooks/userLongPress";
import { ChatPreviewDTO } from "@/lib/types/chat.types";
import { Pin, BellOff } from "lucide-react";
import { ProfilePic } from "@/components/user";
import { ChatOptions } from "@/components/chat";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import { useChatStore } from "@/store/chat.store";
import { formatTime } from "@/lib/utils/time";

interface ChatListItemProps {
  chat: ChatPreviewDTO;
  chatOptionsOpen: string | null;
  setChatOptionsOpen: (chatId: string | null) => void;
  active: boolean;
}

export default function ChatListItem({
  chat,
  chatOptionsOpen,
  setChatOptionsOpen,
  active
}: ChatListItemProps) {
  const router = useRouter();
  const lastMessageSender = useUserStore((s) =>
    chat.lastMessage
      ? s.usersById[chat.lastMessage.senderId]
      : undefined
  );

  const longPressHandlers = useLongPress(() => {
    setChatOptionsOpen(chat.id);
  });

  return (
    <li
      className={`relative px-4 py-3 cursor-pointer flex gap-3 transition-all border-b border-border-subtle group select-none ${
        active
          ? 'bg-surface-selected'
          : 'bg-transparent hover:bg-bg-subtle'
      }`}
      onClick={() => router.push(`/chats/${chat.id}`)}
      onContextMenu={(e) => {
        e.preventDefault();
        setChatOptionsOpen(chat.id);
      }}
      {...longPressHandlers}
    >
      {/* Left indicator strip for active chat */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-accent-primary rounded-r-md transition-all duration-300 ${
          active ? "h-full opacity-100" : "h-0 opacity-0 group-hover:h-4 group-hover:opacity-40 group-hover:top-[30%]"
        }`}
      />

      {/* Avatar */}
      <ProfilePic src={chat.imageUrl} name={chat.name} size={40} />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className={`text-sm font-semibold truncate transition-colors ${
              active ? "text-accent-primary" : "text-text-primary group-hover:text-text-primary"
            }`}>
              {chat.name}
            </h3>
            {chat.muted && <BellOff size={12} className="text-text-muted shrink-0" />}
          </div>
          {chat.lastMessage && (
            <span className="text-[11px] font-medium text-text-muted group-hover:text-text-secondary shrink-0 ml-2 whitespace-nowrap">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-text-secondary truncate pr-2 transition-colors">
            {chat.lastMessage ? (
              <span className="flex items-center gap-1">
                {chat.isGroup && <span className="text-text-muted font-medium shrink-0">{lastMessageSender?.username}:</span>}
                <span className="truncate">{chat.lastMessage.content}</span>
              </span>
            ) : (
              <span className="text-text-muted italic">No messages yet</span>
            )}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
              {chatOptionsOpen === chat.id && (
                <ChatOptions
                  chatId={chat.id}
                  pinned={chat.pinned}
                  muted={chat.muted}
                  unreadCount={chat.unreadCount}
                  setChatOptionsOpen={setChatOptionsOpen}
                />
              )}
            </div>

            {chat.pinned && <Pin size={12} className="text-text-muted -rotate-45" />}
            {chat.unreadCount > 0 && (
              <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent-primary flex items-center justify-center shadow-sm shadow-accent-primary/20">
                <span className="text-[10px] font-bold text-text-inverse">
                  {chat.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

