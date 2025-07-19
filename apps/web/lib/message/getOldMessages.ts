import { IMessage, Message } from "@crewchat/db";
import { toMessageDTO } from "@crewchat/utils/converters";
import { MessageDTO } from "@crewchat/types";

import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";

export async function getOldMessages(
    chatId: string,
    timestamp: string, // ISO string or date
    limit: number = 20
): Promise<MessageDTO[]> {
    await connectToDB();

    const messages = await Message.find({
        chatId: new mongoose.Types.ObjectId(chatId),
        createdAt: { $lt: new Date(timestamp) },
    })
        .sort({ createdAt: -1 }) // newest to oldest
        .limit(limit)
        .lean();


    return messages.map(toMessageDTO); // Convert to DTO format
}

