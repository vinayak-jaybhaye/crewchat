'use server';
import { UserDTO } from "@crewchat/types";
import { connectToDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getUserById as getUser, changeUsername as CU, checkUsernameExists } from "@/lib/user";

export async function getUserById(userId: string): Promise<UserDTO> {
    return getUser(userId);
}

// Check if a username already exists
export async function usernameExists({ username }: { username: string }) {
    try {
        return await checkUsernameExists({ username });
    } catch (error) {
        console.error("Failed to check username existence:", error);
        return false;
    }
}

// Change the current user's username
export async function changeUsername({ username }: { username: string }) {
    try {
        await connectToDB();

        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Please login first!");
        }

        return await CU({ username, userId: user._id });
    } catch (error) {
        console.error("Failed to change username:", error);
        throw error; // optional: let the caller handle it
    }
}