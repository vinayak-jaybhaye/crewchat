"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { getMessagesAction, sendMessageAction, editMessageAction, deleteMessageAction } from "@/lib/actions/message.actions";
import { markChatAsReadAction } from "@/lib/actions/chat.actions";
import { MessageDTO } from "@/lib/types/message.types";
import { Send, Paperclip, Smile, Hash } from "lucide-react";
import { ChatHeader } from "@/components/chat";
import { MessageBubble } from "@/components/chat";
import { useSocket } from "@/components/providers/SocketProvider";
import { useUserStore } from "@/store/user.store";
import { useChatStore } from "@/store/chat.store";
import type { ChatStore } from "@/store/chat.store";

interface ChatWindowParams {
  chatId: string;
  currentUserId: string;
  setIsAboutChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ChatWindow({ chatId, currentUserId, setIsAboutChatOpen }: ChatWindowParams) {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  const { sendTyping } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const bucket = useChatStore((s: ChatStore) => s.messagesByChatId[chatId]);
  const messages = bucket ? bucket.ids.map((id: string) => bucket.entities[id]) : [];
  const chat = useChatStore((s: ChatStore) => s.chatsById[chatId]);

  const cursor = bucket?.cursor;
  const hasMore = bucket?.hasMore;
  const isHydrated = bucket?.isHydrated;

  // Track who is typing
  const typingUsersRecord = useChatStore((s) => s.typingByChatId[chatId]) || {};
  const typingUserIds = Object.keys(typingUsersRecord).filter(
    (uid) => uid !== currentUserId && typingUsersRecord[uid]
  );
  const usersById = useUserStore((s) => s.usersById);
  const typingUsernames = React.useMemo(() => {
    return typingUserIds.map((uid) => usersById[uid]?.username || "Someone");
  }, [typingUserIds, usersById]);

  // hydration (once)
  useEffect(() => {
    if (isHydrated) return;
    loadOlderMessages();
  }, [chatId, isHydrated]);

  useEffect(() => {
    if (!sending) {
      textareaRef.current?.focus();
    }
  }, [sending]);

  // Clean typing states when chat changes or component unmounts
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [chatId]);

  // Auto-resize composer textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [inputText]);

  function handleTyping() {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping({ chatId, isTyping: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping({ chatId, isTyping: false });
    }, 2000);
  }

  function stopTyping() {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping({ chatId, isTyping: false });
    }
  }

  // pagination (scroll up)
  async function loadOlderMessages() {
    if ((isHydrated && !hasMore) || loading) return;
    const el = scrollRef.current;
    if (!el) return;

    const previousScrollHeight = el.scrollHeight;
    setLoading(true);

    try {
      const currentCursor = isHydrated ? cursor : undefined;
      const olderMessages = await getMessagesAction({ chatId, cursor: currentCursor, limit: 30 });

      useChatStore.getState().paginateMessages({
        chatId,
        messages: olderMessages,
        hasMore: olderMessages.length === 30,
        cursor: olderMessages[0]?.createdAt,
      });

      requestAnimationFrame(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - previousScrollHeight;
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isNearBottomRef.current) return;
    scrollToBottom("smooth");
    markChatAsRead();
  }, [isNearBottom, chatId, messages.length]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;

    const TOP_THRESHOLD = 80;
    const BOTTOM_THRESHOLD = 120;

    if (el.scrollTop < TOP_THRESHOLD) {
      loadOlderMessages();
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < BOTTOM_THRESHOLD;
    setIsNearBottom(isNearBottomRef.current);
  }

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    bottomRef.current?.scrollIntoView({ behavior });
  }

  async function markChatAsRead() {
    try {
      await markChatAsReadAction(chatId);
      useChatStore.getState().markChatAsRead(chatId);
    } catch (error) {
      console.error("Failed to mark chat as read", error);
    }
  }

  async function handleSend() {
    const content = inputText.trim();
    if (!content || sending) return;
    setInputText("");
    stopTyping();
    setSending(true);
    setSendError(null);

    try {
      const res = await sendMessageAction(chatId, content);
      if (!res.success) {
        setInputText(content);
        setSendError(res.error.message);
        setTimeout(() => setSendError(null), 4000);
      } else {
        scrollToBottom("smooth");
      }
    } catch (error) {
      console.error("Failed to send", error);
      setInputText(content);
      setSendError("Failed to send message. Please try again.");
      setTimeout(() => setSendError(null), 4000);
    } finally {
      setSending(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {loading && hasMore && (
          <div className="flex justify-center py-2 animate-pulse select-none">
            <span className="text-xs text-text-muted font-medium bg-bg-muted px-2.5 py-1 rounded-full border border-border-subtle shadow-sm">
              Loading older messages...
            </span>
          </div>
        )}

        {!isHydrated && loading ? (
          <MessageStreamSkeleton />
        ) : (
          messages.map((msg: MessageDTO, i: number) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];

            const isLastFromSender = !nextMsg || nextMsg.senderId !== msg.senderId;
            const showAvatar = !isMe && (chat?.isGroup ? true : false) && isLastFromSender;

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
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing & Error Indicator Container */}
      <div className="h-6 relative">
        {sendError ? (
          <div className="absolute left-6 bottom-1 flex items-center gap-2 text-xs text-error font-medium bg-error/10 px-2.5 py-1 rounded-full border border-error/25 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <span>⚠️ {sendError}</span>
          </div>
        ) : typingUsernames.length > 0 ? (
          <div className="absolute left-6 bottom-1 flex items-center gap-2 text-xs text-text-muted select-none">
            <div className="flex gap-1.5 items-center bg-bg-muted/65 px-2.5 py-1 rounded-full border border-border-subtle shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <span className="flex gap-1 mr-1 items-center h-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span>
                <strong className="font-semibold">{typingUsernames.join(", ")}</strong>
                {typingUsernames.length === 1 ? " is typing..." : " are typing..."}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Composer Panel */}
      <div className="border-t border-border-subtle bg-surface-default p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col bg-bg-app border border-border-subtle rounded-2xl shadow-sm focus-within:border-accent-primary focus-within:ring-4 focus-within:ring-accent-primary/10 transition-all overflow-hidden">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a message... (Use **bold**, *italic*, `code`)"
            disabled={sending}
            rows={1}
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[44px] max-h-[200px] leading-relaxed"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border-subtle bg-bg-muted/10">
            <div className="flex items-center gap-1 text-text-muted">
              <button className="p-2 rounded-lg hover:bg-surface-selected hover:text-text-secondary transition-all cursor-pointer" title="Attach files">
                <Paperclip size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-selected hover:text-text-secondary transition-all cursor-pointer" title="Add emoji">
                <Smile size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-selected hover:text-text-secondary transition-all cursor-pointer" title="Formatting help">
                <Hash size={16} />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              className="p-2 rounded-xl bg-accent-primary text-text-inverse hover:bg-accent-strong hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 transition-all cursor-pointer shadow-md shadow-accent-primary/15 flex items-center justify-center"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageStreamSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-2 select-none">
      {/* Sender skeleton */}
      <div className="flex gap-3 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-bg-muted rounded-full w-24" />
          <div className="h-10 bg-bg-muted/65 rounded-2xl rounded-tl-sm w-48" />
        </div>
      </div>

      {/* Me skeleton */}
      <div className="flex gap-3 max-w-[70%] ml-auto justify-end">
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <div className="h-12 bg-bg-muted/75 rounded-2xl rounded-tr-sm w-64" />
        </div>
      </div>

      {/* Sender skeleton */}
      <div className="flex gap-3 max-w-[70%]">
        <div className="w-8 h-8 rounded-full bg-bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-bg-muted rounded-full w-16" />
          <div className="h-8 bg-bg-muted/65 rounded-2xl rounded-tl-sm w-36" />
        </div>
      </div>

      {/* Me skeleton */}
      <div className="flex gap-3 max-w-[70%] ml-auto justify-end">
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <div className="h-16 bg-bg-muted/75 rounded-2xl rounded-tr-sm w-72" />
        </div>
      </div>
    </div>
  );
}