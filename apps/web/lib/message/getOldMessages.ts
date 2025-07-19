import { Message } from "@crewchat/db";
import { toMessageDTO } from "@crewchat/utils/converters";
import { MessageDTO } from "@crewchat/types";

import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";

export type GetOldMessagesParams = {
    chatId: string;
    timestamp: string; // ISO string or date
    limit?: number;
}

export async function getOldMessages({ chatId, timestamp, limit = 20 }: GetOldMessagesParams): Promise<MessageDTO[]> {
    await connectToDB();

    const messages = await Message.find({
        chatId: new mongoose.Types.ObjectId(chatId),
        createdAt: { $lt: new Date(timestamp) },
    })
        .sort({ createdAt: -1 }) // newest to oldest
        .limit(limit)
        .populate("senderId", "username email avatarUrl")
        .lean();


    return messages.map(toMessageDTO).reverse();
}

