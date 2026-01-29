import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface AddMembersInput {
  chatId: string;
  actorId: string;
  userIdsToAdd: string[];
}

export async function addMembers({
  chatId,
  actorId,
  userIdsToAdd,
}: AddMembersInput) {
  const chatObjectId = new Types.ObjectId(chatId);
  const actorObjectId = new Types.ObjectId(actorId);

  // Chat must exist and be a group
  const chat = await ChatModel.findById(chatObjectId).lean();
  if (!chat) throw new Error("Chat not found");
  if (!chat.isGroup) throw new Error("Cannot add members to a DM");

  // Actor must be admin
  const actorMeta = await UserChatMetaDataModel.findOne({
    chatId: chatObjectId,
    userId: actorObjectId,
    role: "admin",
  }).lean();

  if (!actorMeta) {
    throw new Error("Only admins can add members");
  }

  // Normalize user IDs
  const userObjectIds = userIdsToAdd.map(id => new Types.ObjectId(id));

  // Find existing members (idempotency)
  const existingMembers = await UserChatMetaDataModel.find({
    chatId: chatObjectId,
    userId: { $in: userObjectIds },
  }).lean();

  const existingUserIds = new Set(
    existingMembers.map(m => m.userId.toString())
  );

  // Filter users that are NOT already members
  const usersToInsert = userObjectIds
    .filter(id => !existingUserIds.has(id.toString()))
    .map(userId => ({
      chatId: chatObjectId,
      userId,
      role: "member",
    }));

  // Insert all at once
  if (usersToInsert.length > 0) {
    await UserChatMetaDataModel.insertMany(usersToInsert);
  }

  return {
    addedCount: usersToInsert.length,
    skippedCount: existingMembers.length,
  };
}
