export interface ChatDTO {
    _id: string;
    isGroup: boolean;
    members: string[];
    name?: string;
    createdBy?: string;
    imageUrl?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}