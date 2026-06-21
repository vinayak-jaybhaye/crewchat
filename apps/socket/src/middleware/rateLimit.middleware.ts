import type { Socket } from "socket.io";
import { redis } from "../server/redis";

/**
 * Socket.IO event rate limiter middleware.
 * Intercepts incoming events and limits rate using Redis keys per user per event.
 */
export function registerRateLimitMiddleware(socket: Socket) {
  const userId = socket.data.userId;
  if (!userId) return;

  socket.use(async ([event, ...args]: [string, ...any[]], next: (err?: Error) => void) => {
    try {
      // Sensible rate limit presets per 10-second window
      let maxRequests = 100;
      const windowSeconds = 10;

      if (event === "chat:subscribe" || event === "chat:open") {
        maxRequests = 30; // Max 30 chat subscription changes per 10s
      } else if (event.startsWith("call:")) {
        maxRequests = 5;  // Max 5 call controls (start, accept, end) per 10s
      } else if (event.startsWith("webrtc:")) {
        maxRequests = 200; // ICE candidates/signals can be chatty, allow up to 200 per 10s
      } else {
        maxRequests = 50;  // General fallback limit
      }

      const key = `rl:socket:${userId}:${event}`;
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > maxRequests) {
        console.warn(`[RateLimit] User ${userId} rate limited on socket event: ${event}`);
        socket.emit("error:rate_limited", {
          event,
          message: "Too many requests. Please slow down.",
        });
        return next(new Error(`Rate limit exceeded for event ${event}`));
      }

      next();
    } catch (err) {
      console.error("[RateLimit] Error checking socket rate limit:", err);
      // Fail open to avoid breaking connection if Redis is having issues
      next();
    }
  });
}
