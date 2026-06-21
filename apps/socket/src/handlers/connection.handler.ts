import { Server, Socket } from "socket.io";
import { registerCallHandler } from "./call.handler";
import { registerWebRTCHandler } from "./webrtc.handler";
import { registerChatHandlersForSocket } from "./chat.handler";
import { registerRateLimitMiddleware } from "../middleware/rateLimit.middleware";
import { UserModel } from "@crewchat/db";
import { logger } from "@crewchat/logger";
import type { RedisClient } from "../server/redis";

export async function registerConnectionHandler(io: Server, redis: RedisClient) {
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;

    if (!userId) {
      logger.warn({ socketId: socket.id }, "Socket connected without userId, disconnecting");
      socket.disconnect();
      return;
    }

    socket.join(`user:${userId}`);
    logger.info({ userId, socketId: socket.id }, "User connected via socket");

    // Register rate limiter first to protect subsequent handlers
    registerRateLimitMiddleware(socket);

    registerChatHandlersForSocket(socket);
    registerCallHandler(io, socket, redis);
    registerWebRTCHandler(socket);

    socket.on("disconnect", async () => {
      logger.info({ userId, socketId: socket.id }, "User disconnected");

      // 1. Clean up active calls if the user is in a call
      try {
        const callId = await redis.get(`user:activeCall:${userId}`);
        if (callId) {
          const callRaw = await redis.get(`call:${callId}`);
          if (callRaw) {
            const call = JSON.parse(callRaw);
            // End the call as one of the participants disconnected
            await redis.del(`call:${callId}`);
            await redis.del(`user:activeCall:${call.callerId}`);
            await redis.del(`user:activeCall:${call.calleeId}`);

            io.to(`call:${callId}`).emit("call:ended", {
              callId,
              endedBy: userId,
              reason: "disconnect",
            });
            io.in(`call:${callId}`).socketsLeave(`call:${callId}`);
            logger.info({ callId, userId }, "[Disconnect] Ended call because user disconnected");
          } else {
            // Clean up orphaned activeCall key
            await redis.del(`user:activeCall:${userId}`);
          }
        }
      } catch (err) {
        logger.error({ err, userId }, "[Disconnect] Error cleaning up active calls");
      }

      // 2. Update user's lastActive timestamp in the database
      try {
        await UserModel.updateOne({ _id: userId }, { $set: { lastActive: new Date() } });
        logger.debug({ userId }, "[Disconnect] Updated lastActive for user");
      } catch (err) {
        logger.error({ err, userId }, "[Disconnect] Failed to update user lastActive");
      }
    });
  });
}
