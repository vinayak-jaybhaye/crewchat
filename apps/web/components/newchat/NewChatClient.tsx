"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDMAction, DMExistsAction } from "@/lib/actions/chat.actions";
import { sendMessageAction } from "@/lib/actions/message.actions";
import { getUserByIdAction } from "@/lib/actions/user.actions";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export default function NewChatClient({ userId }: { userId: string }) {
  const router = useRouter();

  const [recipient, setRecipient] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(()=> {
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

  const handleSend = async () => {
    if (!message.trim() || sending || !recipient) return;

    setSending(true);
    try {
      const chatId = await createDMAction(recipient.id);
      await sendMessageAction(chatId, message);
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center gap-3 px-4 border-b border-neutral-800">
        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
          {recipient.username[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold">{recipient.username}</p>
          <p className="text-xs text-neutral-400">{recipient.email}</p>
        </div>
      </header>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center text-neutral-500">
          Say hi to {recipient.username}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700"
          placeholder="Type a message…"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="px-4 py-2 rounded-lg bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
