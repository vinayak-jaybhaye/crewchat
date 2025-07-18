import { IMessage, Message } from "@crewchat/db";
import { toMessageDTO } from "@crewchat/utils/converters";
import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";

export async function saveMessageToDB(
    chatId: string,
    senderId: string,
    content: string
): Promise<IMessage> {
    try {
        await connectToDB();

        const newMessage = await Message.create({
            chatId: new mongoose.Types.ObjectId(chatId),
            senderId: new mongoose.Types.ObjectId(senderId),
            content,
        });

        return toMessageDTO(newMessage);

    } catch (error) {
        console.error("Error saving message:", error);
        throw new Error("Failed to save message");
    }
}
