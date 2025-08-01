export interface UserChatMetaDataDTO {
    _id: string;
    userId: string;
    chatId: string;
    lastSeen?: string;
    muted?: boolean;
    pinned?: boolean;
    lastDeleted?: string;
    createdAt?: string;
    updatedAt?: string;
    isAdmin?: boolean;
}