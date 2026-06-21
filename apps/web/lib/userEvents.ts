import { publishEvent } from "./redis";

export async function publishChatJoin(userId: string, chatId: string) {
  await publishEvent("user:events", { type: "chat:join", userId, chatId });
}

export async function publishChatLeave(userId: string, chatId: string) {
  await publishEvent("user:events", { type: "chat:leave", userId, chatId });
}

export async function publishChatJoinMany(userIds: string[], chatId: string) {
  if (userIds.length === 0) return;
  await publishEvent("user:events", { type: "chat:join:many", userIds, chatId });
}
