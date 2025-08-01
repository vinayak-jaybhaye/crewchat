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
    lastSeen?: string | null;
}