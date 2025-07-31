'use client';
import { use, useState, useEffect } from "react";

import { UserChatMetaDataDTO, ChatDTO } from "@crewchat/types";

import { fetchChatData } from '@/app/actions/ChatActions';
import { AddMembers, GroupMembers } from "@/components/chat";
import { fetchUserChatMetaData } from '@/app/actions/ChatActions';

export default function GroupInfoPage({ params }: { params: Promise<{ chatId: string }> }) {
    const { chatId } = use(params);
    const [chatData, setChatData] = useState<ChatDTO | null>(null);
    const [userChatMetadata, setUserChatMetadata] = useState<UserChatMetaDataDTO | null>(null);


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
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm py-4 px-6 flex items-center border-b">
                <h1 className="text-xl font-semibold text-gray-900 truncate">{chatData?.name}</h1>
            </header>

            {/* Chat Details */}
            <section className="bg-white p-6 space-y-2 border-b shadow-sm">
                <p className="text-gray-700 font-medium">Chat ID: <span className="font-normal text-gray-500">{chatId}</span></p>
                <p className="text-gray-700 font-medium">
                    Description:{" "}
                    <span className="font-normal text-gray-500">
                        {chatData?.description || "No description available."}
                    </span>
                </p>
            </section>

            {/* Group Information Title */}
            <h2 className="text-lg font-semibold px-6 py-4 border-b bg-white sticky top-[72px] z-10">
                Group Information
            </h2>

            {/* Members Section */}
            <section className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Members</h3>
                <GroupMembers chatId={chatId} />

                {/* Admin-only Add Members */}
                {userChatMetadata?.isAdmin && (
                    <div className="pt-6 border-t">
                        <AddMembers chatId={chatId} />
                    </div>
                )}
            </section>
        </div>
    );
}
