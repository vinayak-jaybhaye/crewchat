import { Mention } from '@crewchat/db'
import mongoose from "mongoose"

interface RemoveMentionsParams {
    chatId: string
    userId: string  // The user who is removing mentions (usually author of the message)
    messageId: string
    mentionedUsers: string[]
}

export async function removeMentions({
    chatId,
    userId,
    messageId,
    mentionedUsers
}: RemoveMentionsParams) {
    if (!mentionedUsers || mentionedUsers.length === 0) return;

    try {
        await Mention.deleteMany({
            chatId: new mongoose.Types.ObjectId(chatId),
            messageId: new mongoose.Types.ObjectId(messageId),
            mentionedByUserId: new mongoose.Types.ObjectId(userId),
            mentionedUserId: { $in: mentionedUsers.map(id => new mongoose.Types.ObjectId(id)) },
        });
    } catch (err) {
        console.error("Error removing mentions:", err);
        throw new Error("Failed to remove mentions");
    }
}
