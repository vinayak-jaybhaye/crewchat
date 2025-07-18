import { IMessage } from "@crewchat/db";
import { MessageDTO } from "@crewchat/types";

export function toMessageDTO(message: IMessage): MessageDTO {
    return {
        _id: message._id.toString(),
        content: message.content,
        senderId: message.senderId.toString(),
        chatId: message.chatId.toString(),
        createdAt: message.createdAt.toISOString(),
    };
}
