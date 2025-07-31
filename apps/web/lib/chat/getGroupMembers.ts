import { connectToDB } from "@/lib/db";
import { UserChatMetaData } from "@crewchat/db";
import mongoose from "mongoose";

export type GroupMember = {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    isAdmin: boolean;
}

export async function getGroupMembers(groupId: string, userId: string): Promise<GroupMember[]> {
    try {
        await connectToDB();

        // Check if the user is part of the group
        const userChatMeta = await UserChatMetaData.findOne({
            chatId: new mongoose.Types.ObjectId(groupId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!userChatMeta) {
            throw new Error("User is not part of this group");
        }

        // Fetch members of the group
        const members = await UserChatMetaData.find({ chatId: groupId })
            .populate("userId", "username email avatarUrl") // Populate user details
            .select("userId isAdmin");

        return members.map((meta) => ({
            _id: meta.userId._id.toString(),
            username: meta.userId.username,
            email: meta.userId.email,
            avatarUrl: meta.userId.avatarUrl,
            isAdmin: meta.isAdmin,
        }));

    } catch (error) {
        console.error("Error fetching group members:", error);
        throw new Error("Failed to fetch group members");
    }
}