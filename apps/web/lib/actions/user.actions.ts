'use server';

import { auth } from "@/auth";
import { withDB } from "@crewchat/db";
import { searchUsers, getUserById } from "@crewchat/user";
import { UserDTO } from "@/lib/types/user.types";
import { ObjectIdSchema, SearchQuerySchema } from "@/lib/validation/schemas";
import { rateLimitSearch } from "@/lib/rateLimit";

export const searchUsersAction = withDB(async (query: string): Promise<UserDTO[]> => {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error("Unauthorized");

  const validatedQuery = SearchQuerySchema.parse(query);

  // Rate limit search: 20 per minute per user
  await rateLimitSearch(session.user.mongoId);

  const users = await searchUsers({
    query: validatedQuery,
    excludeEmail: session.user.email,
    limit: 10,
  });

  return users;
});

export const getUserByIdAction = withDB(async (userId: string): Promise<UserDTO> => {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedUserId = ObjectIdSchema.parse(userId);

  const user = await getUserById(validatedUserId);
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
});