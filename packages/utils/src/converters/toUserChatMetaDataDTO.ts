import { UserChatMetaDataDTO } from "@crewchat/types";

export function toUserChatMetaDataDTO(meta: any): UserChatMetaDataDTO {
    return {
        _id: meta._id.toString(),
        chatId: meta.chatId.toString(),
        userId: meta.userId.toString(),
        lastSeen: meta.lastSeen?.toISOString() || null,
        muted: meta.muted ?? false,
        pinned: meta.pinned || false,
        isAdmin: meta.isAdmin || false,
        lastDeleted: meta.lastDeleted?.toISOString() || null,
        createdAt: meta.createdAt?.toISOString() || null,
        updatedAt: meta.updatedAt?.toISOString() || null,
        
    };
}
