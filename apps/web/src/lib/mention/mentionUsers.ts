import { Mention } from '@crewchat/db'
import mongoose from "mongoose"

interface MentionUsersParams {
    chatId: string
    userId: string  // The user who is mentioning others
    messageId: string
    mentionedUsers: string[]  // array of mentioned user IDs
}

export async function mentionUsers({
    chatId,
    userId,
    messageId,
    mentionedUsers
}: MentionUsersParams) {
    if (!mentionedUsers || mentionedUsers.length === 0) return;

    const mentionDocs = mentionedUsers.map((mentionedUserId) => ({
        chatId: new mongoose.Types.ObjectId(chatId),
        mentionedUserId: new mongoose.Types.ObjectId(mentionedUserId),
        mentionedByUserId: new mongoose.Types.ObjectId(userId),
        messageId: new mongoose.Types.ObjectId(messageId),
    }));

    try {
        await Mention.insertMany(mentionDocs);
    } catch (err) {
        console.error("Error creating mention documents:", err);
        throw new Error("Failed to store mentions");
    }
}
