import { connectToDB } from "@/lib/db";
import { UserChatMetaData, Chat } from "@crewchat/db";
import { ChatDTO } from "@crewchat/types";
import { toChatDTO } from "@crewchat/utils";

interface Member {
    _id: string;
    username: string;
    avatarUrl?: string;
    email?: string;
}

export async function getChats(userId: string): Promise<ChatDTO[]> {
    await connectToDB();

    // 1. Fetch metadata where current user is part of chat
    const userChatMetas = await UserChatMetaData.find({ userId }).lean();
    const chatIds = userChatMetas.map(meta => meta.chatId);

    if (chatIds.length === 0) {
        return [];
    }

    // 2. Fetch the actual chats
    const chats = await Chat.find({ _id: { $in: chatIds } })
        .populate("members", "username avatarUrl")
        .populate({
            path: "lastMessage",
            select: "content senderId",
            populate: {
                path: "senderId",
                select: "username"
            }
        })
        .sort({ updatedAt: -1 })
        .lean();

    // 3. Prepare safe serializable chat data
    const formattedChats = chats.map(chat => {
        const isGroup = chat.isGroup;
        let name = chat.name || "";
        let imageUrl = chat.imageUrl || "";

        if (!isGroup && chat.members) {
            const otherUser = chat.members.find((member: Member) => member._id.toString() !== userId);
            name = otherUser?.username || chat.members[0]?.username || "Private Chat";
            imageUrl = otherUser?.avatarUrl || chat.members[0]?.avatarUrl || "";
        }
        chat.name = name;
        chat.imageUrl = imageUrl;
        chat.lastMessage = {
            content: chat.lastMessage?.content || "",
            senderId: chat.lastMessage?.senderId?._id || null,
            username: chat.lastMessage?.senderId.username || ""
        }

        // Convert to DTO
        return toChatDTO(chat);
    });

    return formattedChats;
};