import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables");
}

export const redis = createClient({ url: redisUrl });           // For get/set
// export const redisPub = createClient({ url: redisUrl });        // Publisher
// export const redisSub = createClient({ url: redisUrl });        // Subscriber

redis.on("error", (err) => console.error("Redis error:", err));
// redisPub.on("error", (err) => console.error("RedisPub error:", err));
// redisSub.on("error", (err) => console.error("RedisSub error:", err));

export async function connectRedis() {
  await Promise.all([
    redis.connect(),
    // redisPub.connect(),
    // redisSub.connect()
  ]);
  console.log("✅ Redis connected");
}
