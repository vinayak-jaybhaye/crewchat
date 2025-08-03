'use client';
import { use, useState, useEffect } from "react";
import { UserChatMetaDataDTO, ChatDTO } from "@crewchat/types";

import { fetchChatData, fetchUserChatMetaData } from '@/app/actions/ChatActions';
import { AddMembers, GroupMembers } from "@/components/chat";
import { ArrowLeft } from 'lucide-react'
import { useRouter } from "next/navigation";

export default function GroupInfoPage({ params }: { params: Promise<{ chatId: string }> }) {
    const { chatId } = use(params);
    const [chatData, setChatData] = useState<ChatDTO | null>(null);
    const [userChatMetadata, setUserChatMetadata] = useState<UserChatMetaDataDTO | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const chat = await fetchChatData(chatId);
            setChatData(chat);

            const userMetadata = await fetchUserChatMetaData(chatId);
            setUserChatMetadata(userMetadata);
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
        <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Header */}
            <header className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 shadow-sm sticky top-0 z-20">
                <button onClick={() => router.back()}>
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-semibold truncate">{chatData.name}</h1>
            </header>

            {/* Chat Meta Info */}
            <section className="bg-[var(--card)] px-6 py-4 border-b border-[var(--border)] space-y-1">
                <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">Chat ID:</span> {chatId}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">Description:</span> {chatData.description || "No description available."}
                </p>
            </section>

            {/* Members & Group Info */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <section>
                    <h2 className="text-lg font-semibold mb-2">Members</h2>
                    <GroupMembers chatId={chatId} />
                </section>

                {userChatMetadata.isAdmin && (
                    <section className="pt-4 border-t border-[var(--border)]">
                        <h2 className="text-lg font-semibold mb-2">Add Members</h2>
                        <AddMembers chatId={chatId} />
                    </section>
                )}
            </div>
        </div>
    );
}
