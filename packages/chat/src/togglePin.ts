import { Types } from "mongoose";
import { UserChatMetaDataModel } from "@crewchat/db";

export async function togglePin(userId: string, chatId: string, pinned: boolean): Promise<{ success: boolean }> {
    const metadata = await UserChatMetaDataModel.findOne({
        userId: new Types.ObjectId(userId),
        chatId: new Types.ObjectId(chatId),
    });

    if (!metadata) throw new Error("Chat metadata not found");

    metadata.pinned = pinned;
    await metadata.save();
    return { success: true };
}
