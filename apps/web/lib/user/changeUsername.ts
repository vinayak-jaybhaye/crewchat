import { connectToDB } from "@/lib/db";
import { User } from "@crewchat/db";
import mongoose from "mongoose";

export async function changeUsername({ username, userId }: { username: string; userId: string }) {
    try {
        await connectToDB();

        // Convert string ID to ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);

        // Check if new username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error("Username already taken.");
        }

        // Update the user's username
        const updatedUser = await User.findByIdAndUpdate(
            objectId,
            { username },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found.");
        }

        return { "message": "Username change successfully!" };
    } catch (error) {
        console.error("Failed to change username:", error);
        throw error;
    }
}
