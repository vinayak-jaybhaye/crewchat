import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export const redisSub = redis.duplicate();
export type RedisClient = typeof redis;

export async function connectRedis(url: string) {
  if (!redis.isOpen) {
    redis.on("error", (err) =>
      console.error("Redis Client Error", err)
    );

    await redis.connect();
    await redisSub.connect();

    console.log("Redis connected");
  }

  return redis;
}
