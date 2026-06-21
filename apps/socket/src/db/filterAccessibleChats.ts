import { getUserMemberships } from "./getUserMemberships";

export async function filterAccessibleChats(
  userId: string,
  chatIds: string[]
): Promise<string[]> {
  if (chatIds.length === 0) return [];

  const uniqueIds = [...new Set(chatIds)].slice(0, 200);
  const memberships = await getUserMemberships(userId);

  return uniqueIds.filter((id) => memberships.has(id));
}
