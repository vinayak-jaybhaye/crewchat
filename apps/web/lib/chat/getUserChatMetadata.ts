import { connectToDB } from "@/lib/db";
import { toUserChatMetaDataDTO } from "@crewchat/utils/converters";
import { UserChatMetaDataDTO } from "@crewchat/types";
import { UserChatMetaData } from "@crewchat/db";
import mongoose from "mongoose";


export async function getUserChatMetadata(chatId: string, userId: string): Promise<UserChatMetaDataDTO | null> {
    try {
        await connectToDB();

        const metadata = await UserChatMetaData.findOne({
            chatId: new mongoose.Types.ObjectId(chatId),
            userId: new mongoose.Types.ObjectId(userId)
        });
        return toUserChatMetaDataDTO(metadata);
    } catch (error) {
        console.error("Error fetching user chat metadata:", error);
        throw new Error("Failed to fetch user chat metadata");
    }
}