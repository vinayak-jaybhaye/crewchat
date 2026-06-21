import { Types } from "mongoose";
import { UserChatMetaDataModel } from "@crewchat/db";

export async function markChatAsRead(userId: string, chatId: string): Promise<{ success: boolean }> {
    // mark all as read by setting lastSeen to current time and resetting unreadCount
    await UserChatMetaDataModel.updateOne({
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
    }, {
        $set: { lastSeen: new Date(), unreadCount: 0 }
    });

    return { success: true };
}
