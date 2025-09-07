import { connectToDB } from "@/lib/db";
import mongoose from "mongoose";
import { User } from "@crewchat/db";
import { UserDTO } from "@crewchat/types";
import { toUserDTO } from "@crewchat/utils";

export async function getUserById(userId: string): Promise<UserDTO> {
    try {
        await connectToDB();
        const orConditions = [];

        if (mongoose.Types.ObjectId.isValid(userId)) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(userId) });
        }

        orConditions.push(
            { username: userId },
        );
        const user = await User.findOne({
            $or: orConditions
        }).lean();

        if (!user) {
            throw new Error("User not found" + userId);
        }
        return toUserDTO(user);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user by ID");
    }
}