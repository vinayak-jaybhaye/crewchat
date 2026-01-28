import { Types } from "mongoose";
import { MessageModel, UserChatMetaDataModel } from "@crewchat/db";
import { updateLastMessageIfMatches } from "./updateLastMessage";

export interface DeleteMessageInput {
  messageId: string;
  userId: string;
}

export async function deleteMessage({ messageId, userId }: DeleteMessageInput) {
  const message = await MessageModel.findById(new Types.ObjectId(messageId));
  if (!message) throw new Error("Message not found");

  if (message.deletedAt) return message; // idempotent

  const meta = await UserChatMetaDataModel.findOne({
    chatId: message.chatId,
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!meta) throw new Error("Forbidden");

  const isOwner = message.senderId.equals(new Types.ObjectId(userId));
  const isAdmin = meta.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new Error("Forbidden");
  }

  message.deletedAt = new Date();
  await message.save();

  await updateLastMessageIfMatches(message.chatId, message._id, {
    content: null,
    deletedAt: new Date(),
  });

  return {
    success: true,
  };
}
