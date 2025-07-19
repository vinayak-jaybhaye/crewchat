import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { UserChatMetaData, Chat } from "@crewchat/db";

export type AddMembersToGroupChatParams = {
    chatId: string;
    memberIds: string[];
}

export async function addMembersToGroupChat({ chatId, memberIds }: AddMembersToGroupChatParams): Promise<void> {
    try {
        connectToDB();

        // check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error("Chat not found");
        }

        // check if chat is a group chat
        if (!chat.isGroup) {
            throw new Error("This chat is not a group chat");
        }

        const memberObjectIds = memberIds.map(id => new mongoose.Types.ObjectId(id));

        // for each user-chat connection, add user-chat metadata document
        const userChatMetaDataPromises = memberObjectIds.map(async (memberId) => {
            const exists = await UserChatMetaData.findOne({
                chatId: chat._id,
                userId: memberId,
            });

            if (!exists) {
                return UserChatMetaData.create({
                    chatId: chat._id,
                    userId: memberId,
                });
            }

            return null;
        });

        await Promise.all(userChatMetaDataPromises);

        await chat.save();

    } catch (error) {
        console.error("Error adding members to group chat:", error);
        throw new Error("Failed to add members to group chat");
    }
}