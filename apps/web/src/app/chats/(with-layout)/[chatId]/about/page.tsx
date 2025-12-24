'use client';
import { use, useState, useEffect } from "react";
import { UserChatMetaDataDTO, ChatDTO } from "@crewchat/types";

import { fetchChatData, fetchUserChatMetaData } from '@/app/actions/ChatActions';
import { AddMembers, GroupMembers } from "@/components/chat";
import { ArrowLeft, Hash, Info, Calendar, Users, Shield } from 'lucide-react';
import { useRouter } from "next/navigation";
import Image from "next/image";

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
            } catch {
                router.replace('/chats');
            }
        }
        fetchData();
    }, [chatId, router]);

    if (!chatData || !userChatMetadata) {
        return (
            <div className="flex items-center justify-center h-full bg-[var(--background)]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--muted-foreground)] text-sm">Loading details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
            {/* Header */}
            <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3 shadow-sm z-20 flex-shrink-0">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold truncate">About</h1>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

                    {/* Chat Header Card */}
                    <section className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col items-center text-center shadow-sm">
                        {chatData.imageUrl ? (
                            <Image
                                src={chatData.imageUrl}
                                alt={chatData.name}
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full object-cover border-4 border-[var(--background)] shadow-md mb-4"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-3xl font-bold text-white shadow-md mb-4">
                                {chatData.name?.[0]?.toUpperCase()}
                            </div>
                        )}

                        <h2 className="text-2xl font-bold mb-1">{chatData.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                            {chatData.isGroup ? <Users className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                            <span>{chatData.isGroup ? 'Group Chat' : 'Direct Message'}</span>
                        </div>
                    </section>

                    {/* Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex items-start gap-3">
                            <div className="p-2 bg-[var(--muted)] rounded-lg">
                                <Hash className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Chat ID</p>
                                <p className="text-sm font-mono mt-0.5 select-all">{chatId}</p>
                            </div>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex items-start gap-3">
                            <div className="p-2 bg-[var(--muted)] rounded-lg">
                                <Calendar className="w-5 h-5 text-[var(--accent)]" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Created At</p>
                                <p className="text-sm mt-0.5">
                                    {new Date(chatData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-[var(--muted-foreground)]" />
                            <h3 className="font-semibold">Description</h3>
                        </div>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--muted)]/50 p-4 rounded-lg">
                            {chatData.description || <span className="italic text-[var(--muted-foreground)]">No description provided for this chat.</span>}
                        </p>
                    </section>

                    {/* Members Area */}
                    <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/30">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-[var(--primary)]" />
                                <h3 className="font-semibold">Members</h3>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-[var(--background)] rounded-md border border-[var(--border)]">
                                Active
                            </span>
                        </div>

                        <div className="p-5">
                            <GroupMembers chatId={chatId} />
                        </div>

                        {userChatMetadata.isAdmin && (
                            <div className="p-5 border-t border-[var(--border)] bg-[var(--muted)]/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-4 h-4 text-[var(--warning)]" />
                                    <h4 className="text-sm font-medium">Admin Controls</h4>
                                </div>
                                <AddMembers chatId={chatId} />
                            </div>
                        )}
                    </section>

                </div>
            </main>
        </div>
    );
}
