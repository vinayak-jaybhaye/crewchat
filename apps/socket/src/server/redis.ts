import { createClient, RedisClientType } from "redis";

export let redisSub: RedisClientType;

export async function connectRedis(url: string) {
  const redis = createClient({ url });

  redis.on("error", (err: unknown) => console.error("Redis Client Error", err));

  await redis.connect();

  redisSub = redis.duplicate();
  await redisSub.connect();

  console.log("Redis connected");

  return redis;
}