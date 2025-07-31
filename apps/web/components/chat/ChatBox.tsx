'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageDTO } from "@crewchat/types";
import { useSocket } from "@/hooks/useSocket";
import { fetchOldMessages, storeMessage } from "@/app/actions/MessageActions";
import { fetchChatData } from '@/app/actions/ChatActions';
import { type ChatDetails } from '@/lib/chat/getChatDetails';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { LinkPreview } from '@/components/atoms';

type ChatBoxProps = {
    userId: string,
    chatId: string,
}

function ChatBox({ userId, chatId }: ChatBoxProps) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
    const [error, setError] = useState("");
    const [chatData, setChatData] = useState<ChatDetails | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const { sendMessage, onMessage } = useSocket(chatId || "");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();


    // Fetch initial chat data
    useEffect(() => {
        const fetchChat = async () => {
            setLoading(true);
            try {
                const data = await fetchChatData(chatId);
                if (!data) {
                    setError("Chat not found");
                    return;
                }
                setChatData(data);
            } catch (err) {
                console.error("Failed to fetch chat data:", err);
                setError("Failed to load chat data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChat();
    }, [chatId]);

    // Load older messages function
    const loadOlderMessages = useCallback(async () => {
        if (loadingOlderMessages || !hasMoreMessages || messages.length === 0) return;

        try {
            setLoadingOlderMessages(true);

            const oldestMessage = messages[0];
            const olderMessages = await fetchOldMessages(chatId, oldestMessage.createdAt, 20);
            console.log("Loaded older messages:", olderMessages);

            if (olderMessages.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            if (olderMessages.length < 20) {
                setHasMoreMessages(false);
            }

            const container = messagesContainerRef.current;
            const previousScrollHeight = container?.scrollHeight || 0;

            setMessages(prev => [...olderMessages, ...prev]);

            setTimeout(() => {
                requestAnimationFrame(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        const scrollDiff = newScrollHeight - previousScrollHeight;
                        container.scrollTop = scrollDiff;
                    }
                });
            }, 0);

        } catch (error) {
            console.error("Failed to load older messages:", error);
        } finally {
            setLoadingOlderMessages(false);
        }
    }, [chatId, loadingOlderMessages, hasMoreMessages, messages]);

    // Fetch initial messages
    useEffect(() => {
        async function fetchInitialMessages() {
            if (!chatId) return;
            setLoading(true);
            try {
                const initialMessages = await fetchOldMessages(chatId, new Date().toISOString(), 20);
                setMessages(initialMessages);
                setHasMoreMessages(initialMessages.length >= 20);
            } catch (error) {
                console.error("Failed to fetch initial messages:", error);
                setError("Failed to load messages.");
            } finally {
                setLoading(false);
            }
        }

        fetchInitialMessages();

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 1000);

    }, [chatId]);

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (container.scrollTop <= 10 && hasMoreMessages && !loadingOlderMessages) {
            loadOlderMessages();
        }
    }, [hasMoreMessages, loadingOlderMessages, loadOlderMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const isCurrentUser = (senderId: string) => senderId === userId;

    const formatTime = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleTimeString([], options);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        storeMessage(chatId, userId, input)
            .then((savedMessage) => {
                sendMessage(savedMessage);
                setInput("");
            })
            .catch((error) => {
                console.error("Failed to save message:", error);
            });
    };

    const isUserNearBottom = (el: HTMLElement): boolean => {
        const threshold = 800; // pixels
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    };

    useEffect(() => {
        const handleNewMessage = (message: MessageDTO) => {
            const container = messagesContainerRef.current;
            const nearBottom = container && isUserNearBottom(container);

            setMessages((prev) => [...prev, message]);

            if (nearBottom) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 50);
            }
        };
        onMessage(handleNewMessage);
    }, [onMessage]);

    const extractUrl = (text: string): string | null => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = text.match(urlRegex);
        return match ? match[0] : null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">
                <p>Loading chat...</p>
            </div>
        );
    }

    if (!chatId) {
        return (
            <div className="flex items-center justify-center h-full text-[var(--muted-foreground)]">
                <p>Select a chat to start messaging</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[90vh] w-full bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header
                className="bg-[var(--card)] shadow-sm py-4 px-6 flex items-center border-b border-[var(--border)] cursor-pointer"
                onClick={() => router.push(`/chats/${chatId}/about`)}
            >
                {chatData?.imageUrl || chatData?.isGroup ? (
                    <Image
                        src={chatData?.imageUrl || "/group-default.png"}
                        alt={chatData.name || "Chat"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border bg-[var(--avatar-bg)]"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center text-lg font-semibold border border-[var(--border)]">
                        {chatData?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                )}

                <div className="ml-4">
                    <h1 className="font-semibold text-[var(--foreground)]">{chatData?.name || "Chat"}</h1>
                    <p className="text-xs text-[var(--secondary)] flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        ID: {chatId}
                    </p>
                </div>
            </header>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto w-full bg-[var(--card)] p-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div className="max-w-4xl mx-auto">

                    {/* Loading old messages */}
                    {loadingOlderMessages && (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-[var(--secondary)] bg-[var(--background)] shadow">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--secondary)]" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading older messages...
                            </div>
                        </div>
                    )}

                    {/* Start of conversation */}
                    {!hasMoreMessages && messages.length > 0 && (
                        <div className="text-center py-4 text-sm text-[var(--secondary)]">
                            • Beginning of conversation •
                        </div>
                    )}

                    {/* No messages */}
                    {messages.length === 0 && !loading ? (
                        <div className="text-center py-10 text-[var(--secondary)]">
                            <div className="mx-auto w-24 h-24 bg-[var(--avatar-bg)] rounded-full mb-4" />
                            <p>No messages yet</p>
                            <p className="text-sm mt-2">Send a message to start the conversation</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            let senderId: string;
                            if (typeof msg.senderId === 'string') senderId = msg.senderId;
                            else senderId = msg.senderId._id;
                            const isSender = isCurrentUser(senderId);
                            const link = msg.content && extractUrl(msg.content);
                            const cleanMessage = link ? msg.content.replace(link, "").trim() : msg.content;

                            return (
                                <div key={msg._id} className={`flex mb-6 px-3 ${isSender ? "justify-end" : "justify-start"}`}>
                                    <div className={`relative max-w-[85%] sm:max-w-md md:max-w-lg px-4 py-3 rounded-2xl break-words
                                        ${isSender
                                            ? "bg-[var(--primary)] text-white rounded-br-none"
                                            : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-none shadow-md"}`}>

                                        {/* Sender name */}
                                        <div className={`text-xs font-medium mb-1
                                            ${isSender ? "text-[var(--primary-light)]" : "text-[var(--secondary)]"}`}>
                                            {typeof msg.senderId === 'string' ? msg.senderId : msg.senderId.username || "Unknown"}
                                        </div>

                                        {/* Link Preview */}
                                        {link && (
                                            <div className="mb-2 w-full">
                                                <LinkPreview url={link} />
                                            </div>
                                        )}

                                        {/* Message Text */}
                                        <p className="text-sm whitespace-pre-wrap break-words">{cleanMessage}</p>

                                        {/* Timestamp */}
                                        <div className={`text-xs mt-2 ${isSender ? "text-[var(--primary-light)]" : "text-[var(--secondary)]"}`}>
                                            {formatTime(new Date(msg.createdAt))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Box */}
            <form onSubmit={handleSubmit} className="bg-[var(--card)] border-t border-[var(--border)] p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full py-3 pl-4 pr-12 bg-[var(--background)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                                {/* Attachment button (disabled for now) */}
                                <button type="button" className="text-[var(--secondary)] hover:text-[var(--foreground)] p-1" disabled>
                                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="bg-[var(--primary)] text-white rounded-full p-2 hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ChatBox
