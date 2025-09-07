import { connectToDB } from "@/lib/db";
import { Chat, UserChatMetaData } from "@crewchat/db";
import mongoose from "mongoose";

export type RemoveMemberFromGroupChatParams = {
    chatId: string;
    userId: string;
};

export async function removeMemberFromGroupChat({ chatId, userId }: RemoveMemberFromGroupChatParams): Promise<void> {
    try {
        await connectToDB();
        // Check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error("Chat not found");
        }

        // Check if chat is a group chat
        if (!chat.isGroup) {
            throw new Error("This chat is not a group chat");
        }

        // check if user is a member of the chat
        const userchatMetaData = await UserChatMetaData.findOne({
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!userchatMetaData) {
            throw new Error("User is not a member of this chat");
        }

        // Remove user by deleting UserChatMetaData
        await UserChatMetaData.deleteOne({
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(userId),
        });

    } catch (error) {
        console.error("Error connecting to database:", error);
        throw new Error("Database connection failed");
    }
}