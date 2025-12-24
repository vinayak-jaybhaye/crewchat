'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageDTO } from "@crewchat/types";
import { useSocket } from "@/hooks/useSocket";
import { fetchOldMessages } from "@/app/actions/MessageActions";
import { fetchIdUsernameMap } from '@/app/actions/GroupChatActions';
import { fetchChatData } from '@/app/actions/ChatActions';
import { type ChatDetails } from '@/lib/chat/getChatDetails';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageBox } from '@/components/atoms';
import { ArrowLeft, Loader2, MoreVertical, MessageSquare } from 'lucide-react'

import ChatMessage from './ChatMessage';

type ChatBoxProps = {
    userId: string,
    chatId: string,
}

function ChatBox({ userId, chatId }: ChatBoxProps) {
    const [loading, setLoading] = useState(false);
    const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
    const [error, setError] = useState("");
    const [chatData, setChatData] = useState<ChatDetails | null>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const { onMessage } = useSocket(chatId || "");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [idUsernameMap, setIdUsernameMap] = useState<Record<string, string>>({});

    const router = useRouter();

    // Fetch initial chat data
    useEffect(() => {
        const fetchChat = async () => {
            setLoading(true);
            try {
                const data = await fetchChatData(chatId);
                const idUsernameMap = await fetchIdUsernameMap(chatId);
                if (!data) {
                    setError("Chat not found");
                    return;
                }
                setChatData(data);
                setIdUsernameMap(idUsernameMap);
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-[var(--background)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Loading chat...</p>
            </div>
        );
    }

    if (!chatId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] bg-[var(--background)] gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium text-[var(--foreground)]">No Chat Selected</p>
                    <p className="text-sm">Select a chat to start messaging</p>
                </div>
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
        <div className="flex flex-col h-[90vh] w-full bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
            {/* Header */}
            <header
                className="absolute top-0 left-0 right-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] py-3 px-4 flex items-center justify-between shadow-sm transition-all"
                onClick={() => router.push(`/chats/${chatId}/about`)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                    <button
                        className='md:hidden p-2 -ml-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors'
                        onClick={(e) => {
                            e.stopPropagation();
                            router.replace('/chats')
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative flex-shrink-0">
                        {chatData?.imageUrl || chatData?.isGroup ? (
                            <Image
                                src={chatData?.imageUrl || "/group-default.png"}
                                alt={chatData.name || "Chat"}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[var(--background)] shadow-sm group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                                {chatData?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--background)] rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold text-sm sm:text-base leading-tight truncate group-hover:text-[var(--primary)] transition-colors">
                            {chatData?.name || "Chat"}
                        </h1>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                            ID: {chatId}
                        </p>
                    </div>
                </div>

                <button
                    className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </header>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto w-full pt-[72px] px-2 sm:px-4 pb-2 scrollbar-hide bg-[var(--background)]"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div className="max-w-4xl mx-auto space-y-2">

                    {/* Loading old messages */}
                    {loadingOlderMessages && (
                        <div className="flex items-center justify-center py-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/50 rounded-full text-xs text-[var(--muted-foreground)]">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Loading history...</span>
                            </div>
                        </div>
                    )}

                    {/* Start of conversation */}
                    {!hasMoreMessages && messages.length > 0 && (
                        <div className="flex items-center justify-center py-6">
                            <div className="px-4 py-1.5 bg-[var(--muted)]/30 text-[var(--muted-foreground)] text-xs rounded-full border border-[var(--border)]/50">
                                Beginning of conversation
                            </div>
                        </div>
                    )}

                    {/* No messages */}
                    {messages.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)] opacity-70">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--muted)]/50 flex items-center justify-center mb-4 rotate-3">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <p className="font-semibold text-lg">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) =>
                            <ChatMessage
                                key={msg._id}
                                msg={msg}
                                currentUserId={userId}
                                idUsernameMap={idUsernameMap}
                            />
                        )
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Box */}
            <div className="flex-shrink-0 z-20 bg-[var(--background)]">
                <MessageBox userId={userId} chatId={chatId} idUsernameMap={idUsernameMap} scrollToBottom={scrollToBottom} />
            </div>
        </div>
    )
}

export default ChatBox
