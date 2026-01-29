"use client";

import React, { useRef, useState, useEffect } from "react";
import { getMessagesAction, sendMessageAction, editMessageAction, deleteMessageAction } from "@/lib/actions/message.actions";
import { MessageDTO } from "@/lib/types/message.types";
import { Send } from "lucide-react";
import { ChatHeader } from "@/components/chat";
import { MessageBubble } from "@/components/chat";

import { useChatStore } from "@/store/chat.store";
import type { ChatStore } from "@/store/chat.store";

interface ChatWindowParams {
  chatId: string,
  currentUserId: string,
  setIsAboutChatOpen: (open: boolean) => void
}

export default function ChatWindow({ chatId, currentUserId, setIsAboutChatOpen }: ChatWindowParams) {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const bucket = useChatStore((s: ChatStore) => s.messagesByChatId[chatId]);
  const messages = bucket ? bucket.ids.map((id: string) => bucket.entities[id]) : [];
  const chat = useChatStore((s: ChatStore) => s.chatsById[chatId]);

  const cursor = bucket?.cursor;
  const hasMore = bucket?.hasMore;
  const isHydrated = bucket?.isHydrated;

  // hydration (once)
  useEffect(() => {
    if (isHydrated) return;
    loadOlderMessages();
  }, [chatId, isHydrated]);

  useEffect(() => {
    if (!sending) {
      inputRef.current?.focus();
    }
  }, [sending]);

  // pagination (scroll up)
  async function loadOlderMessages() {
    if ((isHydrated && !hasMore) || loading) return;
    setLoading(true);

    try {
      const currentCursor = isHydrated ? cursor : undefined;
      const olderMessages = await getMessagesAction({ chatId, cursor: currentCursor, limit: 30 });

      useChatStore.getState().paginateMessages({
        chatId,
        messages: olderMessages,
        hasMore: olderMessages.length === 30,
        cursor: olderMessages[0].createdAt,
      });

    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const content = inputText.trim();
    if (!content || sending) return;
    setInputText("");
    setSending(true);

    try {
      await sendMessageAction(chatId, content);
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setSending(false);
    }
  }

  async function handleEditMessage(messageId: string, content: string, chatId: string) {
    try {
      await editMessageAction(messageId, content, chatId);
    } catch (error) {
      console.error("Failed to edit", error);
    }
  }

  async function handleDeleteMessage(messageId: string, chatId: string) {
    try {
      await deleteMessageAction(messageId, chatId);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-surface-primary">
      <ChatHeader chat={chat} setIsAboutChatOpen={setIsAboutChatOpen} />
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((msg: MessageDTO, i: number) => {
          const isMe = msg.senderId === currentUserId;
          const prevMsg = messages[i - 1];
          const nextMsg = messages[i + 1];

          // Show avatar if it's the last message from this sender in a sequence, or if the next message is from someone else
          const isLastFromSender = !nextMsg || nextMsg.senderId !== msg.senderId;
          const showAvatar = !isMe && (chat?.isGroup ? true : false) && isLastFromSender;

          // Show name if it's a group, not me, and the first message in a sequence from this sender
          const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId;
          const showName = !isMe && (chat?.isGroup ? true : false) && isFirstFromSender;

          return (
            <MessageBubble
              key={msg.messageId}
              message={msg}
              isMe={isMe}
              isGroup={chat?.isGroup}
              showAvatar={showAvatar}
              showName={showName}
              editMessage={handleEditMessage}
              deleteMessage={handleDeleteMessage}
            />
          );
        })}
      </div>

      <div className="p-3 border-t border-border-subtle bg-surface-selected">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-surface-primary rounded-xl px-4 py-2 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2.5 rounded-xl bg-accent-primary text-text-inverse disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}