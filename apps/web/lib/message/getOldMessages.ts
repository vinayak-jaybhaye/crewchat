import { Message, UserChatMetaData } from "@crewchat/db";
import { toMessageDTO } from "@crewchat/utils";
import { MessageDTO } from "@crewchat/types";

import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";

export type GetOldMessagesParams = {
    chatId: string;
    timestamp: string; // ISO string or date
    userId: string;
    limit?: number;
}

export async function getOldMessages({ chatId, timestamp, userId, limit = 20 }: GetOldMessagesParams): Promise<MessageDTO[]> {
    await connectToDB();

    const userChatMetadata = await UserChatMetaData.findOne({
        chatId: new mongoose.Types.ObjectId(chatId),
        userId: new mongoose.Types.ObjectId(userId),
    });

    if (!userChatMetadata) {
        throw new Error('User not found in chat');
    }

    const messages = await Message.find({
        chatId: new mongoose.Types.ObjectId(chatId),
        createdAt: { $lt: new Date(timestamp), $gte: userChatMetadata.lastDeleted },
    })
        .sort({ createdAt: -1 }) // newest to oldest
        .limit(limit)
        .populate("senderId", "username email avatarUrl")
        .lean();


    return messages.map(toMessageDTO).reverse();
}

