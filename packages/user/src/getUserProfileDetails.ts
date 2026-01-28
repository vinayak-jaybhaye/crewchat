import { Types } from "mongoose";
import { UserModel } from "@crewchat/db";

export interface UserDetails {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    passwordAuthenticationEnabled: boolean;
}

export async function getUserProfileDetails(userId: string): Promise<UserDetails> {
    const user = await UserModel.findById(new Types.ObjectId(userId)).lean();
    if (!user) throw new Error("User not found");

    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        passwordAuthenticationEnabled: user.passwordAuthenticationEnabled,
    };
}