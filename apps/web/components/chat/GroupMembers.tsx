"use client";

import React, { useEffect, useState } from "react";
import { getGroupMembers, removeMember, updateMemberPermissions } from "@/app/actions/GroupChatActions";
import { fetchUserChatMetaData, fetchChatData } from "@/app/actions/ChatActions";
import { UserChatMetaDataDTO } from "@crewchat/types";
import { ChatDetails } from "@/lib/chat/getChatDetails";
import { type GroupMember } from "@/lib/chat/getGroupMembers";
import { startChat } from "@/app/actions/ChatActions";
import { useRouter } from "next/navigation";

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
    }, [])

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

    const toggleOptions = (memberId: string) => {
        setSelectedMemberId((prev) => (prev === memberId ? null : memberId));
    };

    if (loading) return <p>Loading group members...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-2" onClick={() => setSelectedMemberId(null)}>
            <h2 className="text-xl font-semibold mb-2">Group Members</h2>
            {members.length === 0 ? (
                <p>No members found.</p>
            ) : (
                members.map((member) => (
                    <div
                        key={member._id}
                        className="relative flex items-center gap-4 p-2 border rounded cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (chatMetaData?.isGroup) toggleOptions(member._id)
                        }}
                    >
                        <img
                            src={member.avatarUrl || "/default-avatar.png"}
                            alt={member.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-medium">{member.username}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            {member.isAdmin && (
                                <span className="text-xs text-blue-600 font-semibold">Admin</span>
                            )}
                        </div>

                        {(selectedMemberId === member._id && selectedMemberId != userChatMetadata?.userId) && (
                            <div className="absolute top-full right-0 mt-1 bg-white shadow-md rounded p-2 space-y-1 z-10">
                                <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => handleMessageMember(member._id)} >Message</button>
                                {
                                    chatMetaData?.owner === userChatMetadata?.userId && (
                                        <button className="block w-full text-left px-2 py-1 hover:bg-gray-100" onClick={() => handleUpdateAdmin(member._id, !member.isAdmin)}  >{member.isAdmin ? "Remove Admin" : "Make Admin"}</button>
                                    )
                                }
                                {((chatMetaData?.owner === userChatMetadata?._id) || (userChatMetadata?.isAdmin && !member.isAdmin)) &&
                                    <button className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-600" onClick={() => handleRemoveMember(member._id)}>Remove</button>}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default GroupMembers;
