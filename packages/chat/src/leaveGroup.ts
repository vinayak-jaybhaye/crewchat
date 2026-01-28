import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export async function leaveGroup(
  chatId: string,
  userId: string,
) {
  const chat = await ChatModel.findById(new Types.ObjectId(chatId)).lean();
  if (!chat) throw new Error("Chat not found");
  if (!chat.isGroup) throw new Error("Cannot leave a DM");

  const meta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!meta) {
    return { left: false }; // idempotent
  }

  // Prevent last admin from leaving
  if (meta.role === "admin") {
    const adminCount = await UserChatMetaDataModel.countDocuments({
      chatId: new Types.ObjectId(chatId),
      role: "admin",
    });

    if (adminCount <= 1) {
      throw new Error("Cannot leave group as last admin");
    }
  }

  await UserChatMetaDataModel.deleteOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  });

  return { left: true };
}
