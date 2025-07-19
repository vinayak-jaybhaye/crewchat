'use client'

import { useRouter } from 'next/navigation';
import { ChatDTO } from '@crewchat/types';

function ChatCard({ chat }: { chat: ChatDTO }) {
    const router = useRouter();

    const handleChatClick = () => {
        router.push(`/chats/${chat._id}`);
    };

    return (
        <div
            className="flex items-center gap-4 p-4 border-b hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={handleChatClick}
        >
            <img
                src={chat.imageUrl != "" ? chat.imageUrl : "/default-chat-image.png"}
                alt={chat.name}
                className="w-12 h-12 rounded-full object-cover border"
            />
            <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{chat.name}</h2>
                <p className="text-sm text-gray-500 truncate">
                    Last message: {chat.description || "No messages yet"}
                </p>
            </div>
        </div>
    );
}

export default ChatCard;
