import { createClient } from "redis";

export let redis: ReturnType<typeof createClient>;
export let redisSub: ReturnType<typeof createClient>;
export type RedisClient = typeof redis;

export async function connectRedis(url: string) {
  if (!url) {
    throw new Error("Redis URL missing");
  }

  if (!redis) {
    redis = createClient({
      url,
      socket: { tls: true },
    });

    redisSub = redis.duplicate();

    redis.on("error", (err) => console.error("Redis Client Error", err));

    await redis.connect();
    await redisSub.connect();

    console.log("Redis connected");
  }

  return redis;
}
