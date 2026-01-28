interface LastMessage {
    id: string;
    content: string;
    senderId: string;
    deletedAt: string | null;
    createdAt: string;
}

export interface ChatPreviewDTO {
    id: string;
    isGroup: boolean;
    name: string;
    imageUrl: string | null;
    lastMessage: LastMessage | null;
    pinned: boolean;
    muted: boolean;
    unreadCount: number;
}

export interface ChatDetailsDTO {
    id: string;
    isGroup: boolean;
    name: string;
    imageUrl: string | null;
    description: string;
    role: "admin" | "member";
    createdAt: string;
    muted: boolean;
    otherMemberDetails?: {
        id: string;
        username: string;
        avatarUrl?: string;
        email: string;
        lastActive: string;
    }
}

export interface ChatMemberDTO {
    id: string;
    username: string;
    avatarUrl: string | null;
    email: string;
    lastActive?: string;
    role: "member" | "admin";
}

export interface MinimalChatPreviewDTO {
    id: string;
    isGroup: boolean;
    name: string;
    imageUrl: string | null;
    pinned: boolean;
    muted: boolean;
}
