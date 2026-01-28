import { UserChatMetaDataModel } from "@crewchat/db";

export async function canUserAccessChat(userId: string, chatId: string): Promise<boolean> {
    return !!await UserChatMetaDataModel.exists({ chatId, userId });
}