import { Message, User, Chat } from "@crewchat/db";
import { toMessageDTO } from "@crewchat/utils";
import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { MessageDTO } from "@crewchat/types";

export async function saveMessageToDB(
    chatId: string,
    senderId: string,
    content: string
): Promise<MessageDTO> {
    try {
        await connectToDB();

        const newMessage = await Message.create({
            chatId: new mongoose.Types.ObjectId(chatId),
            senderId: new mongoose.Types.ObjectId(senderId),
            content,
        });

        // Update the Chat document's lastMessage reference and updatedAt timestamp
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
            updatedAt: new Date(),
        });

        // Populate sender object in message for DTO
        const populatedMessage = await newMessage.populate("senderId", "_id username avatarUrl");

        return toMessageDTO(populatedMessage);

    } catch (error) {
        console.error("Error saving message:", error);
        throw new Error("Failed to save message");
    }
}
