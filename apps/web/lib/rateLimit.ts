import { ensureRedisConnected, redis } from "./redis";

/**
 * Simple sliding-window rate limiter backed by Redis.
 *
 * Uses a Redis key with TTL to track request counts per window.
 * Key format: `rl:{namespace}:{identifier}`
 *
 * @param namespace - Action or endpoint name (e.g., "sendMessage", "socket-token")
 * @param identifier - User or IP identifier
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Window duration in seconds
 * @returns true if the request is allowed, false if rate limited
 */
export async function checkRateLimit(
  namespace: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  await ensureRedisConnected();

  const key = `rl:${namespace}:${identifier}`;

  // Increment the counter and set TTL if it's a new key
  const count = await redis.incr(key);

  if (count === 1) {
    // First request in this window — set the expiry
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetIn: ttl > 0 ? ttl : windowSeconds,
  };
}

/**
 * Throws an error if the rate limit is exceeded.
 * Designed for use in server actions.
 */
export async function enforceRateLimit(
  namespace: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<void> {
  const result = await checkRateLimit(namespace, identifier, maxRequests, windowSeconds);
  if (!result.allowed) {
    throw new Error(`Rate limited. Try again in ${result.resetIn} seconds.`);
  }
}

// ── Preset rate limiters for common actions ──────────────────────────────────

/** Rate limit for sending messages: 10 per 10 seconds per user */
export async function rateLimitSendMessage(userId: string): Promise<void> {
  await enforceRateLimit("sendMessage", userId, 10, 10);
}

/** Rate limit for creating chats: 5 per minute per user */
export async function rateLimitCreateChat(userId: string): Promise<void> {
  await enforceRateLimit("createChat", userId, 5, 60);
}

/** Rate limit for search: 20 per minute per user */
export async function rateLimitSearch(userId: string): Promise<void> {
  await enforceRateLimit("search", userId, 20, 60);
}

/** Rate limit for socket token: 10 per minute per user */
export async function rateLimitSocketToken(userId: string): Promise<void> {
  await enforceRateLimit("socketToken", userId, 10, 60);
}
