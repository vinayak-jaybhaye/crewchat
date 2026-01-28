import { UserModel } from "@crewchat/db";

interface SearchUsersInput {
  query: string;
  excludeEmail?: string;
  limit?: number;
}

export async function searchUsers({
  query,
  excludeEmail,
  limit = 10,
}: SearchUsersInput) {
  if (!query.trim()) return [];

  const regex = new RegExp(`^${query.trim()}`, "i");

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

