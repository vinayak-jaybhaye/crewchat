"use client";

import ChatWindow from "./ChatWindow";
import AboutChat from "./AboutChat";
import { useState, useEffect } from "react";

import { getChatMembersByIdAction } from "@/lib/actions/chat.actions";
import { useChatStore } from "@/store/chat.store";
import { useUserStore } from "@/store/user.store";
import { useSocket } from "@/components/providers/SocketProvider";
import type { ChatStore } from "@/store/chat.store";
import type { UserStore } from "@/store/user.store";

export default function ChatPageLayout({
  chatId,
  currentUserId,
}: {
  chatId: string;
  currentUserId: string;
}) {
  const [isAboutChatOpen, setIsAboutChatOpen] = useState(false);

  const chatMembers = useChatStore((s: ChatStore) => s.chatMembersByChatId[chatId]);
  const setChatMembers = useChatStore((s: ChatStore) => s.setChatMembers);
  const setActiveChat = useChatStore((s: ChatStore) => s.setActiveChat);
  const upsertUsers = useUserStore((s: UserStore) => s.upsertUsers);
  const { openChat, isConnected } = useSocket();

  useEffect(() => {
    setActiveChat(chatId);
    if (isConnected) openChat(chatId);
    return () => setActiveChat(null);
  }, [chatId, isConnected, openChat, setActiveChat]);

  useEffect(() => {
    if (chatMembers && chatMembers.length > 0) return;

    let cancelled = false;

    (async () => {
      try {
        const membersDTO = await getChatMembersByIdAction(chatId);
        if (cancelled) return;

        // normalize users
        const users = membersDTO.map((m) => ({
          id: m.id,
          username: m.username,
          email: m.email,
          avatarUrl: m.avatarUrl,
          lastActive: m.lastActive,
        }));

        // normalize chat memberships
        const memberships = membersDTO.map((m) => ({
          userId: m.id,
          role: m.role,
        }));

        // store separately
        upsertUsers(users);
        setChatMembers(chatId, memberships);
      } catch (error) {
        console.error("Failed to load chat members:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  return (
    <div className="h-dvh">
      {/* Chat */}
      <div className={`${isAboutChatOpen ? "hidden" : "block"}`}>
        <ChatWindow
          chatId={chatId}
          currentUserId={currentUserId}
          setIsAboutChatOpen={setIsAboutChatOpen}
        />
      </div>

      {/* About */}
      <div className={`${isAboutChatOpen ? "block" : "hidden"}`}>
        <AboutChat
          chatId={chatId}
          setIsAboutChatOpen={setIsAboutChatOpen}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}