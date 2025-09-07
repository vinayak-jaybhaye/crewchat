import { connectToDB } from "@/lib/db";
import { Chat, UserChatMetaData, Message } from "@crewchat/db";


export async function deleteGroupChat(chatId: string, currentUserId: string): Promise<void> {
    try {
        await connectToDB();

         // check if group chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            throw new Error("Group chat not found");
        }
        if (!chat.isGroup) {
            throw new Error("This chat is not a group chat");
        }

        if (chat.owner.toString() !== currentUserId) {
            throw new Error("You are not authorized to delete this group chat");
        }

        // remove all user-chat metadata associated with the chat
        await UserChatMetaData.deleteMany({ chatId: chat._id });

        // remove all messages associated with the chat
        await Message.deleteMany({ chatId: chat._id });

        // delete the chat
        await Chat.deleteOne({ _id: chat._id });
        console.log(`Group chat with ID ${chatId} has been deleted successfully.`);
        return;
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw new Error("Database connection failed");
    }
}