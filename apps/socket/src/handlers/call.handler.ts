import { Server, Socket } from "socket.io";
import type { RedisClient } from "../server/redis";
import { randomUUID } from "crypto";
import { logger } from "@crewchat/logger";


export interface Call {
  callId: string;
  type: "VOICE" | "VIDEO";
  state: "IDLE" | "RINGING" | "CONNECTED";

  callerId: string;
  calleeId: string;

  createdAt: number;
  connectedAt?: number;
  rtcVersion: number;
}

export interface CallStartPayload {
  calleeId: string;
  type: "VOICE" | "VIDEO";
}

export interface CallAcceptPayload {
  callId: string;
}

export interface CallEndPayload {
  callId: string;
}

export async function registerCallHandler(
  io: Server,
  socket: Socket,
  redis: RedisClient
) {
  const userId = socket.data.userId;
  if (!userId) return;

  /* REGISTER USER ACTIONSj */
  socket.on("call:start", async (payload: CallStartPayload) => {
    const { calleeId, type } = payload;

    if (!calleeId || !type) return;
    if (calleeId === userId) return;


    // Check if callee is already in a call
    const calleeActiveCall = await redis.get(`user:activeCall:${calleeId}`);
    if (calleeActiveCall) return;

    // Check if callee is online (room-based presence)
    const calleeRoom = io.sockets.adapter.rooms.get(`user:${calleeId}`);
    if (!calleeRoom || calleeRoom.size === 0) return;

    // Create call
    const callId = randomUUID();

    const call = {
      callId,
      type,
      state: "RINGING",
      callerId: userId,
      calleeId,
      createdAt: Date.now(),
      rtcVersion: 0,
    };

    // Store call in Redis
    await redis.set(
      `call:${callId}`,
      JSON.stringify(call),
      { EX: 30 } // ringing timeout
    );

    // Mark both users as busy
    await redis.set(`user:activeCall:${userId}`, callId, { EX: 30 });
    await redis.set(`user:activeCall:${calleeId}`, callId, { EX: 30 });

    // Join caller to call room
    socket.join(`call:${callId}`);
    io.to(`user:${calleeId}`).socketsJoin(`call:${callId}`);

    // Notify both sides
    socket.emit("call:outgoing", call);
    io.to(`user:${calleeId}`).emit("call:incoming", call);

    logger.info({ callId, callerId: userId, calleeId, type }, "Call started");
  });


  socket.on("call:accept", async (payload: CallAcceptPayload) => {
    const { callId } = payload;
    if (!callId) return;

    // Fetch call
    const callRaw = await redis.get(`call:${callId}`);
    if (!callRaw) return;

    const call = JSON.parse(callRaw);

    // Validate callee & state
    if (call.calleeId !== userId) return;
    if (call.state !== "RINGING") return;

    // Update call state
    call.state = "CONNECTED";
    call.connectedAt = Date.now();

    // Persist call state set ttl to 30 minutes
    await redis.set(`call:${callId}`, JSON.stringify(call), { EX: 1800 });

    // Persist activeCall keys extend ttl to 30 minutes
    await redis.set(`user:activeCall:${call.callerId}`, callId, { EX: 1800 });
    await redis.set(`user:activeCall:${call.calleeId}`, callId, { EX: 1800 });

    // REMOVED -> Join callee to call room - already joined during call:start
    // socket.join(`call:${callId}`);
    // Notify both users
    io.to(`call:${callId}`).emit("call:connected", call);

    logger.info({ callId, callerId: call.callerId, calleeId: call.calleeId }, "Call connected");
  });


  socket.on("call:end", async (payload: CallEndPayload) => {
    const { callId } = payload;
    if (!callId) return;

    // Fetch call
    const callRaw = await redis.get(`call:${callId}`);
    if (!callRaw) return;

    const call = JSON.parse(callRaw);

    // Validate user is part of the call
    if (call.callerId !== userId && call.calleeId !== userId) {
      return;
    }

    // Cleanup Redis state
    await redis.del(`call:${callId}`);
    await redis.del(`user:activeCall:${call.callerId}`);
    await redis.del(`user:activeCall:${call.calleeId}`);

    // Notify both users
    io.to(`call:${callId}`).emit("call:ended", {
      callId,
      endedBy: userId,
    });

    // remove both users from call room
    io.in(`call:${callId}`).socketsLeave(`call:${callId}`);


    logger.info({ callId, endedBy: userId }, "Call ended");
  });


  /* HANDLE RECONNECTION */
  // Check if the user has an active call
  const callId = await redis.get(`user:activeCall:${userId}`);
  if (!callId) return;

  // Retrieve the call state
  const callRaw = await redis.get(`call:${callId}`);
  if (!callRaw) {
    // Clean up if call data is missing
    await redis.del(`user:activeCall:${userId}`);
    return;
  }

  const call: Call = JSON.parse(callRaw);
  // bump rtcversion on reconnection
  call.rtcVersion = (call.rtcVersion ?? 0) + 1;

  // persist back to redis
  await redis.set(`call:${callId}`,JSON.stringify(call),{ KEEPTTL: true });

  // Make the user join the call room
  socket.join(`call:${callId}`);
  // Emit the current call state to the room
  io.to(`call:${callId}`).emit("call:resume", call);

  logger.info({ userId, callId, state: call.state }, "User resumed call");
}



// WHAT IS THIS HANLDER DOING?
// This handler checks if a user has an active call when they connect via socket.io.
// If they do, it retrieves the call state from Redis, makes the user join the call room,
// and emits the current call state back to the user's socket.
