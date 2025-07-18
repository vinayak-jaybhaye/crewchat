'use server';

import { connectToDB } from '@/lib/db';
import { getOldMessages, saveMessageToDB } from '@/lib/message';

export async function fetchOldMessages(chatId: string, timestamp: string, limit: number = 20) {
    await connectToDB();
    return getOldMessages(chatId, timestamp, limit);
}

export async function storeMessage(chatId: string, senderId: string, content: string) {
    await connectToDB();
    return saveMessageToDB(chatId, senderId, content);
}