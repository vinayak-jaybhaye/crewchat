'use server';

import { connectToDB } from '@/lib/db';
import { getOldMessages, saveMessageToDB } from '@/lib/message';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function fetchOldMessages(chatId: string, timestamp: string, limit: number = 20) {
    await connectToDB();
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    return getOldMessages({ chatId, timestamp, limit });
}

export async function storeMessage(chatId: string, senderId: string, content: string) {
    await connectToDB();
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // Ensure senderId is the current user's ID
    if (senderId !== user._id) {
        throw new Error('Sender ID does not match current user');
    }
    return saveMessageToDB(chatId, senderId, content);
}