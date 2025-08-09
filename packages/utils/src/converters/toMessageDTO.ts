import { MessageDTO } from "@crewchat/types";

export function toMessageDTO(message: any): MessageDTO {
    return {
        _id: message._id.toString(),
        content: message.content,
        senderId: {
            _id: message.senderId._id.toString(),
            username: message.senderId.username,
            avatarUrl: message.senderId.avatarUrl || undefined,
        },
        chatId: message.chatId.toString(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
    };
}