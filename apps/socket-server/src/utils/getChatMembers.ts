import { redis } from '../server/redis';
import { UserChatMetaData } from "@crewchat/db";
import { connectToDB } from './db';

// Constants for better maintainability
const CACHE_PREFIX = 'chatMembers:';
const CACHE_TTL = 600; // 10 min

export async function getChatMembers(chatId: string): Promise<string[]> {
    const cacheKey = `${CACHE_PREFIX}${chatId}`;

    try {
        // 1. Try cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Fallback to database
        await connectToDB();
        const members = await UserChatMetaData.find(
            { chatId },
            { userId: 1, _id: 0 } // Explicitly exclude _id
        ).lean(); // Use lean() for better performance

        if (!members?.length) {
            // Cache empty results too to prevent cache penetration
            await redis.set(cacheKey, JSON.stringify([]), { EX: CACHE_TTL });
            return [];
        }

        const memberIds = members
            .map((m) => m.userId && m.userId.toString())
            .filter((id): id is string => !!id);

        // 3. Update cache
        await redis.set(cacheKey, JSON.stringify(memberIds), { EX: CACHE_TTL });

        return memberIds;
    } catch (error) {
        console.error(`Failed to get members for chat ${chatId}:`, error);
        throw error; // Or return [] if you prefer graceful degradation
    }
}