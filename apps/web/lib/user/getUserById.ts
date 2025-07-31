import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { User } from "@crewchat/db";
import { UserDTO } from "@crewchat/types";
import { toUserDTO } from "@crewchat/utils";

export async function getUserById(userId: string): Promise<UserDTO> {
    try {
        await connectToDB();
        const user = await User.findById(new mongoose.Types.ObjectId(userId)).lean();
        if (!user) {
            throw new Error("User not found");
        }
        return toUserDTO(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user by ID");
    }
}