import { connectToDB } from "@/lib/db";
import { UserChatMetaData, User } from "@crewchat/db";
import mongoose from "mongoose";

export type GroupMember = {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    isAdmin: boolean;
}

export async function getGroupMembers(groupId: string, userId: string, username?: string): Promise<GroupMember[]> {
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

        const userFilter: { userId?: { $in: mongoose.Types.ObjectId[] } } = {};

        // If username search is present, fetch matching users first
        // if (username) {
        //     const users = await User.find({
        //         $or: [
        //             { username: { $regex: `^${username}`, $options: "i" } },
        //             { email: { $regex: `^${username}`, $options: "i" } },
        //         ]
        //     }).select("_id");

        //     const matchingUserIds = users.map((u) => u._id);

        //     // If no matches, return empty
        //     if (matchingUserIds.length === 0) return [];

        //     userFilter.userId = { $in: matchingUserIds };
        // }

        // Fetch members of the group
        const members = await UserChatMetaData.aggregate([
            { $match: { chatId: new mongoose.Types.ObjectId(groupId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            ...(username
                ? [
                    {
                        $match: {
                            $or: [
                                { "userDetails.username": { $regex: `^${username}`, $options: "i" } },
                                { "userDetails.email": { $regex: `^${username}`, $options: "i" } },
                            ],
                        },
                    },
                ]
                : []),
            {
                $project: {
                    _id: "$userDetails._id",
                    username: "$userDetails.username",
                    email: "$userDetails.email",
                    avatarUrl: "$userDetails.avatarUrl",
                    isAdmin: 1,
                },
            },
        ]);

        return members.map((meta) => ({
    _id: meta._id.toString(),
    username: meta.username,
    email: meta.email,
    avatarUrl: meta.avatarUrl,
    isAdmin: meta.isAdmin,
}));


    } catch (error) {
        console.error("Error fetching group members:", error);
        throw new Error("Failed to fetch group members");
    }
}