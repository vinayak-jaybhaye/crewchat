import { IChat } from "@crewchat/db";
import { ChatDTO } from "@crewchat/types";
import { toUserDTO } from "./toUserDTO";

export function toChatDTO(chat: IChat): ChatDTO {
    console.log("Converting chat to DTO:", chat);
    return {
        _id: chat._id.toString(),
        name: chat.name || null,
        description: chat.description || null,
        isGroup: chat.isGroup,
        createdBy: chat.createdBy?.toString() || null,
        members: chat.members.map(handleMembers),
        imageUrl: chat.imageUrl || null,
        createdAt: chat.createdAt.toISOString() || undefined,
        updatedAt: chat.updatedAt?.toISOString() || undefined,
    };
}

const handleMembers = (m: any) => {
    if (typeof m === "object" && m !== null && "_id" in m) {
        return toUserDTO(m);
    }
    return m.toString();
};