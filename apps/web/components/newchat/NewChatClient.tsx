"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createDMAction, DMExistsAction } from "@/lib/actions/chat.actions";
import { sendMessageAction } from "@/lib/actions/message.actions";
import { getUserByIdAction } from "@/lib/actions/user.actions";
import { Send, ArrowLeft } from "lucide-react";
import { ProfilePic } from "@/components/user";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export default function NewChatClient({ userId }: { userId: string }) {
  const router = useRouter();

  const [recipient, setRecipient] = useState<User | null>(null);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkDMExists() {
      const chatId = await DMExistsAction(userId);
      if (chatId) {
        router.replace(`/chats/${chatId}`);
      }
    }
    checkDMExists();
  }, [userId])

  useEffect(() => {
    async function loadUser() {
      const user = await getUserByIdAction(userId);
      setRecipient(user);
    }
    loadUser();
  }, [userId]);

  useEffect(() => {
    if (!sending) {
      inputRef.current?.focus();
    }
  }, [sending]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !recipient) return;

    setSending(true);
    try {
      const chatId = await createDMAction(recipient.id);
      await sendMessageAction(chatId, inputText.trim());
      router.replace(`/chats/${chatId}`);
    } finally {
      setSending(false);
    }
  };

  if (!recipient) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Header */}
      <header className="h-14 flex items-center gap-3 px-4 border-b border-neutral-800">
        { /* Back button */}
        <button
          className="p-1 hover:bg-surface-selected md:hidden rounded-full hover:scale-110 transition-colors cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-6 h-6 text-text-primary" />
        </button>
        <div className="flex items-center gap-3">
          <ProfilePic src={recipient.avatarUrl} name={recipient.username} size={32} />
          <div>
            <p className="text-sm font-semibold">{recipient.username}</p>
            <p className="text-xs text-neutral-400">{recipient.email}</p>
          </div>
        </div>
      </header>

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
