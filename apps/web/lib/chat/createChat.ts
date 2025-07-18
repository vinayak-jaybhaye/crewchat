import { connectToDB } from "@/lib/db";
import { Chat, UserChatMetaData } from '@crewchat/db';
import { toChatDTO } from "@crewchat/utils/converters";
import mongoose from "mongoose";

export async function createChat(userId: string, chatId: string) {
    await connectToDB();

    const userId1 = new mongoose.Types.ObjectId(userId);
    const userId2 = new mongoose.Types.ObjectId(chatId);

    // Check if a chat already exists between these two users
    const existingChat = await Chat.findOne({
        isGroup: false,
        members: { $all: [userId1, userId2], $size: 2 },
    });

    console.log("Existing chat found:", existingChat);

    if (existingChat) {
        return toChatDTO(existingChat);
    }

    const newChat = await Chat.create({
        isGroup: false,
        members: [userId1, userId2],
    });

    const meta = await UserChatMetaData.create([
        { userId: userId1, chatId: newChat._id, lastRead: new Date() },
        { userId: userId2, chatId: newChat._id, lastRead: new Date() },
    ]);

    return toChatDTO(newChat);
}