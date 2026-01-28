import { Types } from "mongoose";
import { UserChatMetaDataModel } from "@crewchat/db";

export async function markChatAsRead(userId: string, chatId: string): Promise<{ success: boolean }> {
    // mark all as read by setting lastSeen to current time
    await UserChatMetaDataModel.updateOne({
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
    }, {
        $set: { lastSeen: new Date() }
    });

    return { success: true };
}
