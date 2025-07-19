"use client";
import { useSession } from "next-auth/react";
import { use } from "react";
import { AddMembers, GroupMembers, ChatBox } from "@/components/chat"

export default function ChatRoom({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  const session = useSession();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AddMembers chatId={chatId} />
      <GroupMembers chatId={chatId} />
      <ChatBox userId={session.data?.user._id || ""} chatId={chatId} />

    </div>
  );
}