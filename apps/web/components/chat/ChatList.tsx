"use client";

import { useEffect, useState, useTransition } from "react";
import { getChatsAction } from "@/lib/actions/chat.actions";
import { ChatPreviewDTO } from "@/lib/types/chat.types";
import { Search } from "lucide-react";
import ChatListItem from "@/components/chat/ChatListItem";
import ChatListHeader from "@/components/chat/ChatListHeader";

// store
import { useChatStore } from "@/store/chat.store";
import type { ChatStore } from "@/store/chat.store";

// utils
import { formatTime } from "@/lib/utils/time";

export default function ChatList() {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatOptionsOpen, setChatOptionsOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "groups" | "pinned" | "muted">("all");

  const chatOrder = useChatStore((s: ChatStore) => s.chatOrder);
  const chatsById = useChatStore((s: ChatStore) => s.chatsById);
  const activeChatId = useChatStore((s: ChatStore) => s.activeChatId);

  useEffect(() => {
    if (chatOrder.length === 0) loadChats();
  }, []);

  const loadChats = () => {
    startTransition(async () => {
      const data = await getChatsAction();
      if (data.length === 0) return;

      useChatStore.getState().setChats(data);
    });
  };

  const filteredChats = chatOrder
    .map((chatId: string) => chatsById[chatId])
    .filter((chat: ChatPreviewDTO | undefined): chat is ChatPreviewDTO => {
      if (!chat) return false;

      const matchesSearch = (chat.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (filter) {
        case "unread":
          return chat.unreadCount > 0;
        case "groups":
          return chat.isGroup;
        case "pinned":
          return chat.pinned;
        case "muted":
          return chat.muted;
        default:
          return true;
      }
    });

  return (
    <div className="h-dvh flex flex-col bg-bg-app text-text-primary">
      {/* Header */}
      <ChatListHeader />

      {/* Search & Filter Section */}
      <div className="p-4 space-y-3 border-b border-border-subtle bg-surface-raised shrink-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full h-10 pl-9 pr-4 bg-bg-muted border-2 border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'unread', 'groups', 'pinned', 'muted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${filter === f
                ? 'bg-accent-primary text-text-inverse shadow-lg'
                : 'bg-bg-muted text-text-secondary'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-border-subtle">
        {filteredChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            chatOptionsOpen={chatOptionsOpen}
            setChatOptionsOpen={setChatOptionsOpen}
            active={chat.id === activeChatId}
          />
        ))}

        {isPending && (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-4 py-4 flex gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-bg-muted shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-bg-muted rounded w-1/3" />
                <div className="h-3 bg-bg-muted/60 rounded w-2/3" />
              </div>
            </li>
          ))
        )}

        {!isPending && filteredChats.length === 0 && (
          <li className="px-4 py-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-muted flex items-center justify-center text-text-muted">
              <Search size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-text-secondary font-semibold">No chats found</p>
              <p className="text-xs text-text-muted">Try adjusting your search or filters</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
