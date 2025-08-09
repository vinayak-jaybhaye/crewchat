'use client';

import { useRouter } from 'next/navigation';
import { ChatDTO } from '@crewchat/types';
import Image from 'next/image';

function ChatCard({ chat }: { chat: ChatDTO }) {
    const router = useRouter();

    const handleChatClick = () => {
        router.push(`/chats/${chat._id}`);
    };

    type LastMessage = {
        username?: string;
        content: string;
    };

    const formatLastMessage = (lastMessage: LastMessage) => {
        const regex = /@mention:\{[0-9a-fA-F]{24}\}/g;

        // Replace mentions with @someone
        const replaced = lastMessage.content.replace(regex, '@someone');

        // Trim for preview (cut on word boundary)
        const maxLength = 50;
        let preview = replaced;
        if (replaced.length > maxLength) {
            // cut at last space before maxLength or just slice
            const cutIndex = replaced.lastIndexOf(' ', maxLength);
            preview = cutIndex > 0 ? replaced.slice(0, cutIndex) : replaced.slice(0, maxLength);
            preview += '…';
        }

        return (
            <span>
                <strong>{lastMessage.username ?? 'Someone'}</strong>: {preview}
            </span>
        );
    };



    return (
        <div
            className="flex items-center gap-4 py-2 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] cursor-pointer transition-all shadow-sm"
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
                    {
                        chat.lastMessage ?
                            <>{formatLastMessage(chat.lastMessage)}</>
                            : (
                                chat.description && `${chat.description}`
                            )
                    }
                </p>
            </div>
        </div>
    );
}

export default ChatCard;
