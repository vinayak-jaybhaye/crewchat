import { Types } from "mongoose";
import { UserModel } from "@crewchat/db";

export interface UpdateUsernameParams {
    userId: string;
    username: string;
}

export interface UpdateUsernameResponse {
    success: boolean;
    message: string
}

export interface CheckUsernameAvailabilityParams {
    username: string;
}

export interface CheckUsernameAvailabilityResponse {
    available: boolean;
}

export async function updateUsername(params: UpdateUsernameParams): Promise<UpdateUsernameResponse> {
    // check if username is valid
    if (!params.username) throw new Error("Username is required");
    if (params.username.length < 3) throw new Error("Username must be at least 3 characters long");
    if (params.username.length > 20) throw new Error("Username must be at most 20 characters long");
    if (!/^[a-zA-Z0-9_]+$/.test(params.username)) throw new Error("Username must contain only letters, numbers, and underscores");

    // check if username is already taken
    const user = await UserModel.findOne({ username: params.username });
    if (user) return {
        success: false,
        message: "Username already taken."
    };

    await UserModel.updateOne({ _id: new Types.ObjectId(params.userId) }, { username: params.username });

    return {
        success: true,
        message: "Username updated successfully."
    }
}