'use server';

import { connectToDB } from '@/lib/db';
import { getOldMessages, saveMessageToDB } from '@/lib/message';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { mentionUsers } from '@/lib/mention/mentionUsers';

export async function fetchOldMessages(chatId: string, timestamp: string, limit: number = 20) {
    await connectToDB();
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    return getOldMessages({ chatId, userId: user._id, timestamp, limit });
}

export async function storeMessage(chatId: string, senderId: string, content: string, mentionedUserIds: string[] = []) {
    await connectToDB();
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Ensure senderId is the current user's ID
    if (senderId !== user._id) {
        throw new Error('Sender ID does not match current user');
    }
    const savedMessage = await saveMessageToDB(chatId, senderId, content);
    if (mentionedUserIds.length > 0) {
        await mentionUsers({ chatId, userId: senderId, messageId: savedMessage._id.toString(), mentionedUsers: mentionedUserIds });
    }

    return savedMessage;
}