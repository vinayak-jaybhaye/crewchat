"use client";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { IMessage } from "@crewchat/db";
import { useSession } from "next-auth/react";
import { use } from "react";


export default function ChatRoom({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { chatId } = resolvedParams;

  const { sendMessage, onMessage } = useSocket(chatId);
  const session = useSession();
  // console.log("Session status:", session.status, session.data?.user);

  console.log("ChatRoom rendered for chatId:", chatId);

  useEffect(() => {
    onMessage((data) => {
      console.log("Message received:", data);
    });
  }, [chatId, onMessage]);

  const handleMessage = (message: string) => {
    if (session.status !== "authenticated" || !session.data?.user?.id) return;

    const msg: IMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: session.data.user.id,
      chatId,
      timestamp: new Date().toISOString(),
    };
    sendMessage(msg);
  };

  return (
    <div>
      <button onClick={() => handleMessage("hello ")}>Send</button>
      this is chat room {chatId}
      {
        session.data?.user.avatarUrl ? (
          <img src={session.data.user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700">No Avatar</span>
          </div>
        )
      }
    </div>
  );
}
