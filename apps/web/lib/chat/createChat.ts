import { connectToDB } from "@/lib/db";
import { Chat, UserChatMetaData } from '@crewchat/db';
import { toChatDTO } from "@crewchat/utils/converters";
import mongoose from "mongoose";

export async function createChat(user1Id: string, user2Id: string) {
    await connectToDB();

    const userId1 = new mongoose.Types.ObjectId(user1Id);
    const userId2 = new mongoose.Types.ObjectId(user2Id);

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

    const metaDocs = [{ userId: userId1, chatId: newChat._id, lastRead: new Date() }];
    // if user created the chat with themselves, we don't need to create a metadata document for the second user
    if (user1Id !== user2Id) metaDocs.push({ userId: userId2, chatId: newChat._id, lastRead: new Date() });
    const meta = await UserChatMetaData.create(metaDocs);

    return toChatDTO(newChat);
}