"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSocket } from "@/hooks/useSocket";
import { IMessage } from "@crewchat/db";
import { useSession } from "next-auth/react";
import { fetchOldMessages, storeMessage } from "@/app/actions/MessageActions";

export default function ChatRoom({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage, onMessage } = useSocket(chatId);
  const session = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const initialMessages = await fetchOldMessages(chatId, new Date().toISOString(), 5);
        setMessages(initialMessages.reverse()); // Reverse to show oldest first
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [chatId])

  useEffect(() => {
    onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });
  }, [chatId, onMessage]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || session.status !== "authenticated" || !session.data?.user?.id) return;

    storeMessage(chatId, session.data.user.id, input)
      .then((savedMessage) => {
        sendMessage(savedMessage);
        setInput("");
      })
      .catch((error) => {
        console.error("Failed to save message:", error);
      });
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === session.data?.user?.id;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center border-b">
        <div className="bg-indigo-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
          {chatId.slice(0, 2).toUpperCase()}
        </div>
        <div className="ml-4">
          <h1 className="font-semibold text-gray-800">Chat Room</h1>
          <p className="text-xs text-gray-500 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            ID: {chatId}
          </p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex mb-6 ${isCurrentUser(msg.senderId) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${isCurrentUser(msg.senderId)
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div
                    className={`text-xs mt-1 ${isCurrentUser(msg.senderId) ? "text-indigo-200" : "text-gray-500"
                      }`}
                  >
                    {formatTime(new Date(msg.createdAt))}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-t p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full py-3 pl-4 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700"
                  disabled={!input.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}