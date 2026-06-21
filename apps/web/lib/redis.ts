import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) throw new Error("Missing REDIS_URL env var");

export const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => console.error("Redis Client Error", err));

let connectPromise: Promise<unknown> | null = null;

export async function ensureRedisConnected(): Promise<void> {
  if (redis.isOpen) return;

  if (!connectPromise) {
    connectPromise = redis.connect().catch((err) => {
      connectPromise = null;
      throw err;
    });
  }

  await connectPromise;
}

export async function publishEvent(channel: string, payload: unknown): Promise<void> {
  await ensureRedisConnected();
  await redis.publish(channel, JSON.stringify(payload));
}
