import { createClient } from "redis";

export let redis: ReturnType<typeof createClient>;
export let redisSub: ReturnType<typeof createClient>;
export let redisAdapterPub: ReturnType<typeof createClient>;
export let redisAdapterSub: ReturnType<typeof createClient>;
export type RedisClient = typeof redis;

export async function connectRedis(url: string) {
  if (!url) {
    throw new Error("Redis URL missing");
  }

  if (!redis) {
    redis = createClient({ url });
    redisSub = redis.duplicate();
    redisAdapterPub = redis.duplicate();
    redisAdapterSub = redis.duplicate();

    redis.on("error", (err) => console.error("Redis Client Error", err));
    redisAdapterPub.on("error", (err) =>
      console.error("Redis Adapter Pub Error", err)
    );
    redisAdapterSub.on("error", (err) =>
      console.error("Redis Adapter Sub Error", err)
    );

    await Promise.all([
      redis.connect(),
      redisSub.connect(),
      redisAdapterPub.connect(),
      redisAdapterSub.connect(),
    ]);

    console.log("Redis connected");
  }

  return redis;
}

export async function pingRedis(): Promise<boolean> {
  if (!redis?.isOpen) return false;
  const result = await redis.ping();
  return result === "PONG";
}

export async function disconnectRedis() {
  const clients = [redisSub, redisAdapterSub, redisAdapterPub, redis];
  for (const client of clients) {
    try {
      if (client?.isOpen) await client.quit();
    } catch (err) {
      console.error("Redis shutdown error:", err);
    }
  }
}
