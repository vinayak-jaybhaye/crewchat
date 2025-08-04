"use client";

import React, { useEffect, useState } from "react";
import { getGroupMembers, removeMember, updateMemberPermissions } from "@/app/actions/GroupChatActions";
import { fetchUserChatMetaData, fetchChatData } from "@/app/actions/ChatActions";
import { UserChatMetaDataDTO } from "@crewchat/types";
import { ChatDetails } from "@/lib/chat/getChatDetails";
import { type GroupMember } from "@/lib/chat/getGroupMembers";
import { startChat } from "@/app/actions/ChatActions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Ban, } from "lucide-react";

function GroupMembers({ chatId }: { chatId: string }) {
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [userChatMetadata, setUserChatMetadata] = useState<UserChatMetaDataDTO | null>(null);
    const [chatMetaData, setChatMetaData] = useState<ChatDetails | null>(null);

    useEffect(() => {
        const fetchChatMetaData = async () => {
            try {
                const metadata = await fetchUserChatMetaData(chatId);
                const chatDetails = await fetchChatData(chatId);
                if (!metadata) {
                    setError("Chat metadata not found.");
                }
                setUserChatMetadata(metadata);
                setChatMetaData(chatDetails);
            } catch (err) {
                console.error(err);
                setError("Failed to load chat metadata.");
            }
        }
        fetchChatMetaData();
    }, [chatId]);

    const router = useRouter();

    const handleMessageMember = async (memberId: string) => {
        const chat = await startChat(memberId);
        router.push("/chats/" + chat._id);
    }

    const handleUpdateAdmin = async (memberId: string, isAdmin: boolean) => {
        try {
            await updateMemberPermissions(chatId, memberId, isAdmin);
            setMembers((prev) => prev.map(member => member._id === memberId ? { ...member, isAdmin } : member));
            setSelectedMemberId(null);
        } catch (err) {
            console.error(err);
            setError("Failed to update member permissions.");
        }
    }
    const handleRemoveMember = async (memberId: string) => {
        try {
            await removeMember(chatId, memberId);
            setMembers((prev) => prev.filter(member => member._id !== memberId));
            setSelectedMemberId(null);
        } catch (err) {
            console.error(err);
            setError("Failed to remove member.");
        }
    }

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const data = await getGroupMembers(chatId);
                setMembers(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load group members.");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [chatId]);

    useEffect(() => {
        const handleMouseClick = () => {
            setSelectedMemberId(null);
        };

        window.addEventListener('click', handleMouseClick);

        return () => {
            window.removeEventListener('click', handleMouseClick);
        };
    }, []);


    const toggleOptions = (memberId: string) => {
        setSelectedMemberId((prev) => (prev === memberId ? null : memberId));
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[var(--text-secondary)]">Loading group members...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <div className="w-12 h-12 bg-[var(--error)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-[var(--error)] text-xl">⚠</span>
                </div>
                <p className="text-[var(--error)] font-medium">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6" onClick={() => setSelectedMemberId(null)}>
            <div className="border-b border-[var(--border)] pb-4">
                <h2 className="text-2xl font-bold text-[var(--text)] mb-1">Group Members</h2>
                <p className="text-[var(--text-secondary)] text-sm">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
            </div>

            {members.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-[var(--text-secondary)] text-2xl">👥</span>
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium">No members found</p>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">This group appears to be empty</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member._id}
                            className="relative group"
                        >
                            <div
                                className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl cursor-pointer transition-all duration-200 hover:bg-[var(--card-hover)] hover:shadow-sm hover:border-[var(--primary)] hover:border-opacity-30"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (chatMetaData?.isGroup) toggleOptions(member._id)
                                }}
                            >
                                <div className="relative">
                                    <Image
                                        src={member.avatarUrl || "/default-avatar.png"}
                                        alt={member.username}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--border)] group-hover:ring-[var(--primary)] group-hover:ring-opacity-30 transition-all duration-200"
                                    />
                                    {member.isAdmin && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">★</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p
                                            className="font-semibold text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer truncate"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/user/${member._id}`);
                                            }}
                                        >
                                            {member.username}
                                        </p>
                                        {member.isAdmin && (
                                            <span className="inline-flex items-center px-2 rounded-full text-xs font-medium bg-[var(--primary)] bg-opacity-10 text-[var(--text)]">
                                                {member._id === chatMetaData?.owner ? 'Owner' : 'Admin'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] truncate">{member.email}</p>
                                </div>

                                {chatMetaData?.isGroup && (
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mx-1"></div>
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mx-1"></div>
                                        <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full mx-1"></div>
                                    </div>
                                )}
                            </div>

                            {(selectedMemberId === member._id && selectedMemberId != userChatMetadata?.userId) && (
                                <div className="absolute top-full right-4 mt-2 bg-[var(--card)] shadow-lg border border-[var(--border)] rounded-lg py-2 min-w-[160px] z-10 animate-in fade-in-0 zoom-in-95 duration-200">
                                    <button
                                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--muted)] transition-colors duration-150"
                                        onClick={() => handleMessageMember(member._id)}
                                    >
                                        <span className="text-[var(--primary)]">💬</span>
                                        Message
                                    </button>

                                    {chatMetaData?.owner === userChatMetadata?.userId && (
                                        <button
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--muted)] transition-colors duration-150"
                                            onClick={() => handleUpdateAdmin(member._id, !member.isAdmin)}
                                        >
                                            <span className="text-[var(--warning)]">
                                                {member.isAdmin ? "⭐" : "👑"}
                                            </span>
                                            {member.isAdmin ? "Remove Admin" : "Make Admin"}
                                        </button>
                                    )}

                                    {((chatMetaData?.owner === userChatMetadata?._id) || (userChatMetadata?.isAdmin && !member.isAdmin)) && (
                                        <div className="border-t border-[var(--border)] mt-1 pt-1">
                                            <button
                                                className="flex items-center gap-3 w-full text-left px-4 py-2 text-[var(--error)] hover:bg-[var(--error)] hover:bg-opacity-10 transition-colors duration-150"
                                                onClick={() => handleRemoveMember(member._id)}
                                            >
                                                <Ban />
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GroupMembers;