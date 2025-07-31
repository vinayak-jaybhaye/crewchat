import { MessageDTO } from "@crewchat/types";
import { toUserDTO } from "./toUserDTO";
export function toMessageDTO(message: any): MessageDTO {
    return {
        _id: message._id.toString(),
        content: message.content,
        senderId: handleMembers(message.senderId),
        chatId: message.chatId.toString(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
    };
}


const handleMembers = (m: any) => {
    if (typeof m === "object" && m !== null && "_id" in m) {
        return toUserDTO(m);
    }
    return m.toString();
};