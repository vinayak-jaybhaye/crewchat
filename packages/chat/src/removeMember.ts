import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface RemoveMemberInput {
  chatId: string;
  actorId: string;
  userIdToRemove: string;
}

export async function removeMember({
  chatId,
  actorId,
  userIdToRemove,
}: RemoveMemberInput) {
  // Chat must exist and be a group
  const chat = await ChatModel.findById(new Types.ObjectId(chatId)).lean();
  if (!chat) throw new Error("Chat not found");
  if (!chat.isGroup) throw new Error("Cannot remove members from a DM");

  // Actor metadata
  const actorMeta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(actorId),
  }).lean();

  if (!actorMeta) throw new Error("Forbidden");

  const isSelfRemoval = actorId === userIdToRemove;
  const isAdmin = actorMeta.role === "admin";

  if (!isSelfRemoval && !isAdmin) {
    throw new Error("Only admins can remove other members");
  }

  // Target metadata
  const targetMeta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userIdToRemove),
  }).lean();

  if (!targetMeta) {
    return { removed: false }; // idempotent
  }

  // Prevent removing last admin
  if (targetMeta.role === "admin") {
    const adminCount = await UserChatMetaDataModel.countDocuments({
      chatId: new Types.ObjectId(chatId),
      role: "admin",
    });

    if (adminCount <= 1) {
      throw new Error("Cannot remove the last admin");
    }
  }

  // Remove member
  await UserChatMetaDataModel.deleteOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userIdToRemove),
  });

  return { removed: true };
}
