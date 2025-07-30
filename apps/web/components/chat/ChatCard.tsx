'use client';

import { useRouter } from 'next/navigation';
import { ChatDTO } from '@crewchat/types';
import Image from 'next/image';

function ChatCard({ chat }: { chat: ChatDTO }) {
    const router = useRouter();

    const handleChatClick = () => {
        router.push(`/chats/${chat._id}`);
    };

    return (
        <div
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] cursor-pointer transition-all shadow-sm"
            onClick={handleChatClick}
        >
            {chat?.imageUrl || chat?.isGroup ? (
                <Image
                    src={chat.imageUrl || '/group-default.png'}
                    alt={chat.name || 'Chat'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border bg-[var(--avatar-bg)]"
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--avatar-bg)] text-[var(--avatar-text)] flex items-center justify-center text-lg font-semibold border">
                    {chat?.name?.[0]?.toUpperCase() || "?"}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium text-[var(--foreground)] truncate">
                    {chat.name}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                    {chat.description ? `Last message: ${chat.description}` : "No messages yet"}
                </p>
            </div>
        </div>
    );
}

export default ChatCard;
