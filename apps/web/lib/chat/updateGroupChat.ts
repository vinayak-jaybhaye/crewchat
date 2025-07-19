import { connectToDB } from "@/lib/db";
import { Chat } from "@crewchat/db";

export type updateGroupChatParams = {
    chatId: string;
    name?: string;
    description?: string;
};

export async function updateGroupChat({ chatId, name, description }: updateGroupChatParams): Promise<void> {
    try {
        await connectToDB();

        // Check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error("Chat not found");
        }

        // Update chat properties
        if (name) {
            chat.name = name;
        }
        if (description !== undefined) {
            chat.description = description;
        }

        await chat.save();
    } catch (error) {
        console.error("Error updating chat:", error);
        throw new Error("Failed to update chat");
    }
}