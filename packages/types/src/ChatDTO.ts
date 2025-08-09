import { UserDTO } from "./UserDTO";

export interface ChatDTO {
    _id: string;
    isGroup: boolean;
    members: string[] | UserDTO[];
    name?: string;
    owner?: string;
    imageUrl?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    lastMessage? :{
        content: string;
        senderId: string | null;
        username?: string;
    }
    lastSeen?: string | null;
}