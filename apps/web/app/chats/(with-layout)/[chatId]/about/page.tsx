'use client';
import { use, useState, useEffect } from "react";
import { UserChatMetaDataDTO, ChatDTO } from "@crewchat/types";

import { fetchChatData, fetchUserChatMetaData } from '@/app/actions/ChatActions';
import { AddMembers, GroupMembers } from "@/components/chat";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function GroupInfoPage({ params }: { params: Promise<{ chatId: string }> }) {
    const { chatId } = use(params);
    const [chatData, setChatData] = useState<ChatDTO | null>(null);
    const [userChatMetadata, setUserChatMetadata] = useState<UserChatMetaDataDTO | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const chat = await fetchChatData(chatId);
                setChatData(chat);
    
                const userMetadata = await fetchUserChatMetaData(chatId);
                setUserChatMetadata(userMetadata);
            } catch (error) {
                router.replace('/chats');
            }
        }
        fetchData();
    }, [chatId]);

    if (!chatData || !userChatMetadata) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--background)]">
                <p className="text-[var(--muted-foreground)] text-sm">Loading chat details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[90vh] bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-20">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-[var(--muted)] transition"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold truncate">{chatData.name}</h1>
            </header>

            {/* Chat Meta Info */}
            <section className="bg-[var(--card)] px-6 py-4 border-b border-[var(--border)] space-y-2">
                <div>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Chat ID</p>
                    <p className="text-sm font-mono text-[var(--foreground)]">{chatId}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">Description</p>
                    <p className="text-sm text-[var(--foreground)]">
                        {chatData.description || <span className="italic text-[var(--muted-foreground)]">No description provided.</span>}
                    </p>
                </div>
            </section>

            {/* Members & Admin Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-8">
                <section>
                    <h2 className="text-lg font-semibold mb-3 border-b border-[var(--border)] pb-2">Members</h2>
                    <GroupMembers chatId={chatId} />
                </section>

                {userChatMetadata.isAdmin && (
                    <section>
                        <AddMembers chatId={chatId} />
                    </section>
                )}
            </div>
        </div>
    );
}
