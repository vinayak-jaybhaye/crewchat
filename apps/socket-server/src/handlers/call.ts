import { Server, Socket } from "socket.io";
import { redis } from "../server/redis";
import { randomUUID } from "crypto";

const disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

export function handleCallEvents(io: Server, socket: Socket) {
    let currentUserId: string | null = null;

    // Register user
    socket.on("register-user", async (userId: string) => {
        currentUserId = userId;
        socket.join(userId);
        console.log(`User ${socket.id} joined room/user ${userId}`);

        // Cancel disconnect timer if user reconnects
        if (disconnectTimers.has(userId)) {
            clearTimeout(disconnectTimers.get(userId)!);
            disconnectTimers.delete(userId);
            console.log(`Reconnect: Cleared disconnect timer for ${userId}`);
        }

        // If user had an ongoing call, notify them
        const callId = await redis.get(`user:${userId}:activeCall`);
        if (callId) {
            const callDataRaw = await redis.get(`call:${callId}`);
            if (callDataRaw) {
                const callData = JSON.parse(callDataRaw);
                io.to(userId).emit("incoming-call", callData); // notify user about their ongoing call

                // notify other user in the call to reconnect
                const otherUser = callData.caller === userId ? callData.callee : callData.caller;
                io.to(otherUser).emit("reconnect-needed");
            }
        }
    });

    // Call initiated
    socket.on("call", async ({ other, type, caller }) => {
        console.log(`CALL INITIATED FROM  ${caller} to ${other} of type ${type}`);
        if(other === caller) return;
        const existingCallerCallId = await redis.get(`user:${caller}:activeCall`);

        if (existingCallerCallId) {
            // get other user from the call
            const existingCallRaw = await redis.get(`call:${existingCallerCallId}`);
            if (!existingCallRaw) return;
            const existingCallData = JSON.parse(existingCallRaw);
            const otherUser = existingCallData.caller === caller ? existingCallData.callee : existingCallData.caller;
            await redis.del(`call:${existingCallerCallId}`);
            await redis.del(`user:${caller}:activeCall`);
            await redis.del(`user:${otherUser}:activeCall`);

            // notify other user that call has ended
            const endPayload = { ...existingCallData, status: "ended", endedBy: caller };
            io.to(otherUser).emit("incoming-call", endPayload);
        }

        const existingCalleeCallId = await redis.get(`user:${other}:activeCall`);
        if (existingCalleeCallId) {
            const busyPayload = {
                status: "callee-busy",
                reason: "User is already in another call"
            };
            io.to(caller).emit("incoming-call", busyPayload);
            return;
        }

        const callId = randomUUID();
        const payload = {
            callId,
            caller,
            callee: other,
            type,
            status: "calling",
            createdAt: Date.now(),
        };

        await redis.set(`call:${callId}`, JSON.stringify(payload), { EX: 60 });
        await redis.set(`user:${caller}:activeCall`, callId, { EX: 60 });
        await redis.set(`user:${other}:activeCall`, callId, { EX: 60 });

        io.to(caller).emit("incoming-call", payload);
        io.to(other).emit("incoming-call", payload);
    });

    // Call accepted
    socket.on("accept-call", async ({ callId }) => {
        const callRaw = await redis.get(`call:${callId}`);
        if (!callRaw) return;

        const callData = JSON.parse(callRaw);
        callData.status = "accepted";
        callData.acceptedAt = Date.now();

        await redis.set(`call:${callId}`, JSON.stringify(callData), { EX: 1200 });
        await redis.set(`user:${callData.caller}:activeCall`, callId, { EX: 1200 });
        await redis.set(`user:${callData.callee}:activeCall`, callId, { EX: 1200 });

        io.to(callData.caller).emit("incoming-call", callData);
        io.to(callData.callee).emit("incoming-call", callData);
    });

    // Call rejected
    socket.on("reject-call", async ({ callId }) => {
        const callRaw = await redis.get(`call:${callId}`);
        if (!callRaw) return;

        const callData = JSON.parse(callRaw);

        await redis.del(`call:${callId}`);
        await redis.del(`user:${callData.caller}:activeCall`);
        await redis.del(`user:${callData.callee}:activeCall`);

        const rejectPayload = { ...callData, status: "rejected" };
        io.to(callData.caller).emit("incoming-call", rejectPayload);
        io.to(callData.callee).emit("incoming-call", rejectPayload);
    });

    // Call ended
    socket.on("hang-up", async ({ callId, by }) => {
        const callRaw = await redis.get(`call:${callId}`);
        if (!callRaw) return;

        const callData = JSON.parse(callRaw);
        await redis.del(`call:${callId}`);
        await redis.del(`user:${callData.caller}:activeCall`);
        await redis.del(`user:${callData.callee}:activeCall`);

        const endPayload = { ...callData, status: "ended", endedBy: by };
        io.to(callData.caller).emit("incoming-call", endPayload);
        io.to(callData.callee).emit("incoming-call", endPayload);
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
        if (!currentUserId) return;
        const callId = await redis.get(`user:${currentUserId}:activeCall`);
        if (!callId) return;

        console.log(`User ${currentUserId} disconnected. Starting 10s cleanup timer.`);

        const timer = setTimeout(async () => {
            const callId = await redis.get(`user:${currentUserId}:activeCall`);
            if (!callId) return;

            const callRaw = await redis.get(`call:${callId}`);
            if (!callRaw) return;

            const callData = JSON.parse(callRaw);
            const otherUser = callData.caller === currentUserId ? callData.callee : callData.caller;

            await redis.del(`call:${callId}`);
            await redis.del(`user:${callData.caller}:activeCall`);
            await redis.del(`user:${callData.callee}:activeCall`);

            const endPayload = { ...callData, status: "disconnected" };
            io.to(otherUser).emit("incoming-call", null);
            io.to(currentUserId!).emit("incoming-call", null);

            console.log(`Call cleaned up for ${currentUserId} and ${otherUser}`);
        }, 10000);

        disconnectTimers.set(currentUserId, timer);
    });
}
