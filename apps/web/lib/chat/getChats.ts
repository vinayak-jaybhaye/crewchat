import { connectToDB } from "@/lib/db";
import { UserChatMetaData, Chat } from "@crewchat/db";
import { ChatDTO } from "@crewchat/types";
import { toChatDTO } from "@crewchat/utils/converters";


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
        .lean();

    // 3. Prepare safe serializable chat data
    const formattedChats = chats.map(chat => {
        const isGroup = chat.isGroup;
        let name = chat.name || "";
        let imageUrl = chat.imageUrl || "";

        if (!isGroup && chat.members) {
            const otherUser = chat.members.find((member: any) => member._id.toString() !== userId);
            name = otherUser?.username || chat.members[0]?.username || "Private Chat";
            imageUrl = otherUser?.avatarUrl || chat.members[0]?.avatarUrl || "";
        }
        chat.name = name;
        chat.imageUrl = imageUrl;

        // Convert to DTO
        return toChatDTO(chat);
    });

    return formattedChats;
};