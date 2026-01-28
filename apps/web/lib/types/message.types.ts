export interface MessageDTO {
    messageId: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
}