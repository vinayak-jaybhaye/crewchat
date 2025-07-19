import { connectToDB } from "@/lib/db";
import { UserChatMetaData, Chat } from "@crewchat/db";
import { ChatDTO } from "@crewchat/types";
import { toChatDTO } from "@crewchat/utils/converters";
import mongoose from "mongoose";

export interface ChatDetails extends ChatDTO {
    lastSeen?: string | null;
}

export async function getChatDetails(chatId: string, userId: string): Promise<ChatDetails> {
    try {
        console.log("Connecting to database to fetch chat details...");
        await connectToDB();

        const userChatMeta = await UserChatMetaData.findOne({
            chatId: new mongoose.Types.ObjectId(chatId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!userChatMeta) {
            throw new Error("User is not part of this chat");
        }

        const chat = await Chat.findById(chatId)
            .populate("members", "username email avatarUrl");

        if (!chat) {
            throw new Error("Chat not found");
        }

        // Format chat before DTO
        if (!chat.isGroup) {
            const otherUser = chat.members.find((member: any) => member._id.toString() !== userId);
            chat.name = otherUser?.username || "Direct Chat";
            chat.imageUrl = otherUser?.avatarUrl || "";
        } else {
            chat.name = chat.name || "Group Chat";
            chat.imageUrl = chat.imageUrl || "";
        }

        const formattedChat = toChatDTO(chat);
        formattedChat.lastSeen = userChatMeta.lastSeen?.toISOString() || null;

        return formattedChat;
    } catch (error) {
        console.error("Error fetching chat details:", error);
        throw new Error("Failed to fetch chat details");
    }
}
