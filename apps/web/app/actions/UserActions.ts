'use server';
import { UserDTO } from "@crewchat/types";
import { getUserById as getUser } from "@/lib/user";

export async function getUserById(userId: string): Promise<UserDTO> {
    return getUser(userId);
}