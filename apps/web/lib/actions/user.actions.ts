'use server';

import { auth } from "@/auth";
import { connectToDB } from "@crewchat/db";
import { searchUsers, getUserById } from "@crewchat/user";
import { UserDTO } from "@/lib/types/user.types";

export async function searchUsersAction(query: string): Promise<UserDTO[]> {
  const session = await auth();
  if (!session?.user || !session.user.email) throw new Error("Unauthorized");

  if (!query || query.length < 2) return [];

  await connectToDB(process.env.MONGODB_URI!);

  const users = await searchUsers({
    query,
    excludeEmail: session.user.email,
    limit: 10,
  });

  return users;
}

export async function getUserByIdAction(userId: string): Promise<UserDTO> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await connectToDB(process.env.MONGODB_URI!);

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
  }
}