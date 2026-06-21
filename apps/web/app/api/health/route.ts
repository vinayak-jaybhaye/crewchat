import mongoose from "mongoose";
import { connectToDB } from "@crewchat/db";
import { ensureRedisConnected, redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function pingMongo(): Promise<boolean> {
  try {
    await connectToDB(process.env.MONGODB_URI!);
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return false;
    }
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (err) {
    console.error("[Health] MongoDB check failed:", err);
    return false;
  }
}

async function pingRedis(): Promise<boolean> {
  try {
    await ensureRedisConnected();
    const result = await redis.ping();
    return result === "PONG";
  } catch (err) {
    console.error("[Health] Redis check failed:", err);
    return false;
  }
}

export async function GET() {
  const [mongodb, redisOk] = await Promise.all([
    pingMongo(),
    pingRedis(),
  ]);

  const healthy = mongodb && redisOk;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: Date.now(),
      checks: { mongodb, redis: redisOk },
    },
    { status: healthy ? 200 : 503 },
  );
}
