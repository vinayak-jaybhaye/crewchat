import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) throw new Error("Missing REDIS_URL env var");

export const redis = createClient({
    url: REDIS_URL,
});

redis.connect();