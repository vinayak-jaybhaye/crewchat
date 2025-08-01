import { UserDTO } from "./UserDTO";

export interface MessageDTO {
    _id: string;
    content: string;
    senderId: string | UserDTO;
    chatId: string;
    createdAt: string;
    updatedAt: string;
    isAdmin?: boolean;
    lastDeleted?: string | null;
    lastSeen?: string | null;
    pinned?: boolean;
}