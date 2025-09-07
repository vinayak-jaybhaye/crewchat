import { MessageDTO } from "@crewchat/types";
import { LinkPreview } from '@/components/atoms';
import { MessageWithMentions, Avatar } from '@/components/atoms';

const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return date.toLocaleTimeString([], options);
};

const extractUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};

type MessageProps = {
    msg: MessageDTO;
    currentUserId: string;
    idUsernameMap: Record<string, string>;
};

export default function ChatMessage({ msg, currentUserId, idUsernameMap }: MessageProps) {
    let senderId: string;
    let senderInfo: { username: string; avatarUrl?: string };

    if (typeof msg.senderId === 'string') {
        senderId = msg.senderId;
        senderInfo = {
            username: idUsernameMap[msg.senderId] || "Unknown",
            avatarUrl: undefined
        };
    } else {
        senderId = msg.senderId._id;
        senderInfo = {
            username: msg.senderId.username || "Unknown",
            avatarUrl: msg.senderId.avatarUrl
        };
    }

    const isSender = senderId === currentUserId;
    const link = msg.content && extractUrl(msg.content);
    const cleanMessage = link ? msg.content.replace(link, "").trim() : msg.content;

    return (
        <div key={msg._id} className={`flex mb-4 px-3 ${isSender ? "justify-end" : "justify-start"}`}>
            {/* Avatar for received messages */}
            {!isSender && (
                <div className="flex-shrink-0 mr-3 mt-1">
                    <Avatar
                        username={senderInfo.username}
                        avatarUrl={senderInfo.avatarUrl}
                        size={28}
                    />
                </div>
            )}

            {/* Message bubble */}
            <div className={`relative max-w-[75%] ${isSender ? 'ml-12' : 'mr-12'}`}>
                {/* Message header with sender info */}
                <div className="flex items-center gap-2 mb-1 ml-1">
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                        {senderInfo.username}
                    </span>
                    {msg.pinned && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                            📌
                        </span>
                    )}
                </div>

                {/* Message content */}
                <div className={`px-4 py-3 rounded-2xl break-words transition-all duration-200 hover:shadow-md
                    ${isSender
                        ? "bg-[var(--primary)] text-white rounded-br-md shadow-lg"
                        : "bg-[var(--card)] text-[var(--foreground)] rounded-bl-md border border-[var(--border)] shadow-sm"
                    }`}>

                    {/* Link Preview */}
                    {link && (
                        <div className="mb-3 w-full overflow-hidden rounded-lg">
                            <LinkPreview url={link} />
                        </div>
                    )}

                    {/* Message Text */}
                    {cleanMessage && (
                        <div className="leading-relaxed">
                            <MessageWithMentions
                                cleanMessage={cleanMessage}
                                idUsernameMap={idUsernameMap}
                            />
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 opacity-70 
                        ${isSender ? "text-white" : "text-[var(--muted-foreground)]"}`}>
                        {formatTime(new Date(msg.createdAt))}
                        {msg.lastSeen && isSender && (
                            <span className="ml-2">✓</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Avatar for sent messages */}
            {isSender && (
                <div className="flex-shrink-0 ml-3 mt-1">
                    {senderInfo.avatarUrl && (
                        <Avatar
                            username={senderInfo.username}
                            avatarUrl={senderInfo.avatarUrl}
                            size={28}
                        />
                    )}
                </div>
            )}
        </div>
    );
};