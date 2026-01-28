"use client";

import { useLongPress } from "@/hooks/userLongPress";
import { ChatPreviewDTO } from "@/lib/types/chat.types";
import { Pin, BellOff } from "lucide-react";
import ProfilePic from "@/components/user/ProfilePic";
import ChatOptions from "./ChatOptions";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
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
    const lastMessageSender = useUserStore((s) => s.usersById[chat.lastMessage?.senderId]);

    const longPressHandlers = useLongPress(() => {
        setChatOptionsOpen(chat.id);
    });

    return (
        <li
            className={`px-4 py-3 cursor-pointer flex gap-3 transition-all border-b group ${active
                ? 'bg-surface-selected border border-border-strong'
                : 'hover:bg-surface-selected border border-border-subtle'
                }`}
            onClick={() => router.push(`/chats/${chat.id}`)}
            onContextMenu={(e) => {
                e.preventDefault();
                setChatOptionsOpen(chat.id);
            }}
            {...longPressHandlers}
        >
            {/* Avatar */}
            <ProfilePic src={chat.imageUrl} name={chat.name} size={40} />

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold truncate text-text-primary group-hover:text-accent-primary transition-colors">
                            {chat.name}
                        </h3>
                        {chat.muted && <BellOff size={12} className="text-text-primary shrink-0" />}
                    </div>
                    {chat.lastMessage && (
                        <span className="text-xs text-text-muted group-hover:text-text-secondary shrink-0 ml-2 whitespace-nowrap">
                            {formatTime(chat.lastMessage.createdAt)}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <p className="text-sm text-text-secondary truncate pr-2 group-hover:text-text-primary transition-colors">
                        {chat.lastMessage ? (
                            <span className="flex items-center gap-1">
                                {chat.isGroup && <span className="text-text-muted font-medium">{lastMessageSender?.username}:</span>}
                                {chat.lastMessage.content}
                            </span>
                        ) : (
                            "No messages yet"
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

                        {chat.pinned && <Pin size={12} className="text-text-primary -rotate-45" />}
                        {chat.unreadCount > 0 && (
                            <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent-primary flex items-center justify-center shadow-lg">
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

