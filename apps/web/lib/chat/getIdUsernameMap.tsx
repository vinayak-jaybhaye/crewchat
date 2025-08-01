import { UserChatMetaData } from '@crewchat/db';
import { connectToDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * Returns a map of { userId: username } for all members in a given chat
 */
export async function getIdUsernameMap(chatId: string): Promise<Record<string, string>> {
    await connectToDB();

    const members = await UserChatMetaData.find({
        chatId: new mongoose.Types.ObjectId(chatId)
    })
        .populate('userId', 'username')
        .lean();

    const map: Record<string, string> = {};

    for (const member of members) {
        const user = member.userId as { _id: mongoose.Types.ObjectId; username: string };
        map[user._id.toString()] = user.username;
    }

    return map;
}
