export interface MessageDTO {
    _id: string;
    content: string;
    senderId: string | {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    chatId: string;
    createdAt: string;
    updatedAt: string;
    isAdmin?: boolean;
    lastDeleted?: string | null;
    lastSeen?: string | null;
    pinned?: boolean;
}