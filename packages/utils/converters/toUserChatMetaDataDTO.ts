import { IUserChatMetaData } from "@crewchat/db";
import { UserChatMetaDataDTO } from "@crewchat/types";

export function toUserChatMetaDataDTO(meta: IUserChatMetaData): UserChatMetaDataDTO {
    return {
        _id: meta._id.toString(),
        chatId: meta.chatId.toString(),
        userId: meta.userId.toString(),
        lastSeen: meta.lastSeen?.toISOString() || null,
        muted: meta.muted ?? false,
        pinned: meta.pinned || false,
        
    };
}
