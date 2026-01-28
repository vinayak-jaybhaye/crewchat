"use server";

import { auth } from "@/auth";
import { connectToDB } from "@crewchat/db";
import { updatePasswordAuthStatus, updateUsername as updateUsernameCore, getUserProfileDetails, checkUsernameAvailability as checkUsernameAvailabilityCore } from "@crewchat/user";
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

export async function updateUsername(username: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await connectToDB(process.env.MONGODB_URI!);

    await updateUsernameCore(session.user.mongoId, username);

    return true;
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
    await connectToDB(process.env.MONGODB_URI!);

    // check if username is valid
    if (!username) throw new Error("Username is required");
    if (username.length < 3) throw new Error("Username must be at least 3 characters long");
    if (username.length > 20) throw new Error("Username must be at most 20 characters long");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error("Username must contain only letters, numbers, and underscores");

    const user = await checkUsernameAvailabilityCore(username);
    if (!user.available) throw new Error("Username already taken");

    return true;
}

