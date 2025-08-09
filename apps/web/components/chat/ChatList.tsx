'use client';

import { useEffect, useState } from 'react';
import ChatCard from './ChatCard';
import { fetchUserChats } from "@/app/actions/ChatActions";
import { ChatDTO } from '@crewchat/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGlobalSocket } from '@/context/SocketProvider';
import { useSession } from 'next-auth/react';

export default function ChatList() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchedChats, setMatchedChats] = useState<ChatDTO[]>([]);
    const socket = useGlobalSocket();
    const session = useSession()


    useEffect(() => {
        const fetchChats = async () => {
            const fetchedChats = await fetchUserChats();
            setChats(fetchedChats);
        };
        fetchChats();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setMatchedChats(chats);
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const filteredChats = chats.filter(chat =>
                chat.name?.toLowerCase().includes(lowerCaseQuery) ||
                chat.description?.toLowerCase().includes(lowerCaseQuery)
            );
            setMatchedChats(filteredChats);
        }
    }, [searchQuery, chats]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification', (message) => {
            const lastMessage = {
                content: message.content,
                senderId: message.senderId._id,
                username: message.senderId.username
            };

            setChats((prevChats) => {
                // Find index of chat with message.chatId
                const chatIndex = prevChats.findIndex(chat => chat._id === message.chatId);

                if (chatIndex === -1) {
                    // Chat not found — maybe fetch chats again or ignore
                    return prevChats;
                }

                // Create updated chat object with new lastMessage and updatedAt (optional)
                const updatedChat = {
                    ...prevChats[chatIndex],
                    lastMessage,
                    updatedAt: new Date().toISOString(), // or message.createdAt if available
                };

                // Create new chats array with updated chat moved to front
                return [
                    updatedChat,
                    ...prevChats.slice(0, chatIndex),
                    ...prevChats.slice(chatIndex + 1),
                ];
            });
        });


        return () => {
            socket.off('notification');
        }
    }, [socket, session.data?.user._id]);

    const handleCreateChat = () => {
        router.push('/chats/new');
    };

    return (
        <div className="relative flex flex-col h-full w-full p-4 bg-[var(--background)] text-[var(--foreground)] border-r border-[var(--border)] shadow-lg">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border-b border-[var(--border)] rounded-md shadow-sm bg-[var(--input)] text-[var(--input-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[var(--ring)] transition-all duration-150 ease-in-out"

                />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {(searchQuery ? matchedChats : chats).map(chat => (
                    <ChatCard key={chat._id} chat={chat} />
                ))}
                {(searchQuery || chats.length) === 0 && (
                    <p className="text-center text-[var(--muted-foreground)] mt-10">No chats found.</p>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-8 right-8">
                <button
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white p-3 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)]"
                    aria-label="New Chat"
                    onClick={handleCreateChat}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
