import { connectToDB } from "@/lib/db";
import { Chat, UserChatMetaData } from "@crewchat/db";
import mongoose from "mongoose";

export type UpdateGroupChatMemberParams = {
    chatId: string;
    userId: string;
    isAdmin?: boolean;
}

export async function updateGroupChatMember({ chatId, userId, isAdmin }: UpdateGroupChatMemberParams): Promise<void> {
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

        // Check if user is a member of the chat
        const userChatMetaData = await UserChatMetaData.findOne({
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!userChatMetaData) {
            throw new Error("User is not a member of this chat");
        }

        // Update the user's admin status
        userChatMetaData.isAdmin = isAdmin ?? userChatMetaData.isAdmin;

        await userChatMetaData.save();
    } catch (error) {
        console.error("Error updating group chat member:", error);
        throw new Error("Failed to update group chat member");
    }
}