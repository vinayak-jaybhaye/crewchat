import { Types } from "mongoose";
import { UserModel } from "@crewchat/db";

export async function updatePasswordAuthStatus(userId: string, enabled: boolean, password: string): Promise<{ success: boolean }> {
    await UserModel.updateOne({ _id: new Types.ObjectId(userId) }, { passwordAuthenticationEnabled: enabled, password_hash: password });

    return {
        success: true,
    }
}