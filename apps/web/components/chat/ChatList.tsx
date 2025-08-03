'use client';

import { useEffect, useState } from 'react';
import ChatCard from './ChatCard';
import { fetchUserChats } from "@/app/actions/ChatActions";
import { ChatDTO } from '@crewchat/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatList() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [matchedChats, setMatchedChats] = useState<ChatDTO[]>([]);

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

    const handleCreateChat = () => {
        router.push('/chats/new');
    };

    return (
        <div className="relative flex flex-col h-full w-full p-4 bg-[var(--background)] text-[var(--foreground)]">
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
