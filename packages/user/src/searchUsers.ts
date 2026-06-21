import { UserModel } from "@crewchat/db";

interface SearchUsersInput {
  query: string;
  excludeEmail?: string;
  limit?: number;
}

/**
 * Escape all regex metacharacters so user input is treated as a literal string.
 * Prevents ReDoS attacks from crafted patterns like `(a+)+$`.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchUsers({
  query,
  excludeEmail,
  limit = 10,
}: SearchUsersInput) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > 50) return [];

  const regex = new RegExp(`^${escapeRegex(trimmed)}`, "i");

  const filter: any = {
    $or: [{ username: regex }, { email: regex }],
  };

  // exclude current user
  if (excludeEmail) {
    filter.email = { $ne: excludeEmail };
  }

  const users = await UserModel.find(filter)
    .select("_id username email avatarUrl")
    .limit(limit)
    .lean();

  // serialize for Client Components
  return users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl ?? null,
  }));
}

