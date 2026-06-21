import { getUserMemberships } from "./getUserMemberships";

export async function canUserAccessChat(userId: string, chatId: string): Promise<boolean> {
  const memberships = await getUserMemberships(userId);
  return memberships.has(chatId);
}