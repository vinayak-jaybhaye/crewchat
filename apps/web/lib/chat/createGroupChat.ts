import { ChatDTO } from "@crewchat/types";
import { Chat, UserChatMetaData } from "@crewchat/db";
import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { toChatDTO } from "@crewchat/utils/converters";


export type createGroupChatParams = {
    name: string;
    description?: string;
    owner: string;
};

export async function createGroupChat(group: createGroupChatParams): Promise<ChatDTO> {
    try {
        await connectToDB();
        const chatData = {
            name: group.name,
            members: [new mongoose.Types.ObjectId(group.owner)],
            owner: group.owner,
            isGroup: true,
            description: group?.description || "",
        }
        const chat = await Chat.create(chatData);

        console.log("Group chat created:", chat);

        // add the owner as an admin in UserChatMetaData
        await UserChatMetaData.create({
            chatId: chat._id,
            userId: new mongoose.Types.ObjectId(group.owner),
            isAdmin: true,
        });

        return toChatDTO(chat)
    } catch (error) {
        console.error("Error creating group chat:", error);
        throw new Error("Failed to create group chat");
    }
}