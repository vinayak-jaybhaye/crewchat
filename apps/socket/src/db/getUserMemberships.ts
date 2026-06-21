import { redis } from "../server/redis";
import { UserChatMetaDataModel } from "@crewchat/db";
import { Types } from "mongoose";

/**
 * Retrieves the set of chat IDs the user has access to, caching the result in a Redis Set.
 */
export async function getUserMemberships(userId: string): Promise<Set<string>> {
  const cacheKey = `user:memberships:${userId}`;

  try {
    const exists = await redis.exists(cacheKey);
    if (exists) {
      const chatIds = await redis.sMembers(cacheKey);
      // Remove placeholder if present
      const filtered = chatIds.filter((id) => id !== "__none__");
      return new Set(filtered);
    }
  } catch (err) {
    console.error("[getUserMemberships] Redis read error:", err);
  }

  // Cache miss or Redis error — query MongoDB
  const memberships = await UserChatMetaDataModel.find({
    userId: new Types.ObjectId(userId),
  })
    .select("chatId")
    .lean();

  const chatIds = memberships.map((m) => m.chatId.toString());

  try {
    if (chatIds.length > 0) {
      await redis.sAdd(cacheKey, chatIds);
    } else {
      // Store placeholder to avoid cache stampede on empty memberships
      await redis.sAdd(cacheKey, "__none__");
    }
    // Expire the key in 1 hour
    await redis.expire(cacheKey, 3600);
  } catch (err) {
    console.error("[getUserMemberships] Redis write error:", err);
  }

  return new Set(chatIds);
}
