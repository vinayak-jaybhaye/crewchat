"use server";

import { auth } from "@/auth";
import { connectToDB } from "@crewchat/db";
import { updatePasswordAuthStatus, updateUsername as updateUsernameCore, getUserProfileDetails } from "@crewchat/user";
import bcrypt from "bcryptjs";
import { UserDetailsDTO } from "@/lib/types/user.types";

export async function getUserProfileDetailsAction(): Promise<UserDetailsDTO> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDB(process.env.MONGODB_URI!);

  const user = await getUserProfileDetails(session.user.mongoId);
  if (!user) throw new Error("User not found");

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    passwordAuthenticationEnabled: user.passwordAuthenticationEnabled,
  };
}

export async function enablePasswordAuthentication(password: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // block example users from disabling auth their email contains "example.com"

  if(!session.user.email || session.user.email.includes("example.com")) {
    throw new Error("Action not allowed for example users");
  }

  if(password.length < 6) throw new Error("Password must be at least 6 characters long");

  await connectToDB(process.env.MONGODB_URI!);

  const password_hash = await bcrypt.hash(password, 10);

  await updatePasswordAuthStatus(session.user.mongoId, true, password_hash);

  return true;
}

export async function disablePasswordAuthentication(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await updatePasswordAuthStatus(session.user.mongoId, false, "");

  return true;
}

export async function updateUsername(username: string): Promise<{ success: boolean, message: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  return await updateUsernameCore({ userId: session.user.mongoId, username: username });
}