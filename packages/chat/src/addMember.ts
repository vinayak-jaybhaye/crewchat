import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface AddMemberInput {
  chatId: string;
  actorId: string; // who is performing the action
  userIdToAdd: string;
}

export async function addMember({
  chatId,
  actorId,
  userIdToAdd,
}: AddMemberInput) {

  // Chat must exist and be a group
  const chat = await ChatModel.findById(new Types.ObjectId(chatId)).lean();
  if (!chat) throw new Error("Chat not found");
  if (!chat.isGroup) throw new Error("Cannot add members to a DM");

  // Actor must be admin
  const actorMeta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(actorId),
  }).lean();

  if (!actorMeta || actorMeta.role !== "admin") {
    throw new Error("Only admins can add members");
  }

  // Check if user already a member (idempotent)
  const existing = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userIdToAdd),
  }).lean();

  if (existing) {
    return { added: false };
  }

  // Add member
  await UserChatMetaDataModel.create({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userIdToAdd),
    role: "member",
  });

  return { added: true };
}
