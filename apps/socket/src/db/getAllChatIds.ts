import { UserChatMetaDataModel } from "@crewchat/db";

export async function getAllChatIds(userId: string): Promise<string[]> {
  const rows = await UserChatMetaDataModel
    .find({ userId })
    .select("chatId")
    .lean();

  return rows.map((row: any) => row.chatId.toString());
}
