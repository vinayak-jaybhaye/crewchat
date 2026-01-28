import { Types } from "mongoose";
import { MessageModel } from "@crewchat/db";
import { updateLastMessageIfMatches } from "./updateLastMessage";

export interface EditMessageInput {
  messageId: string;
  userId: string;
  content: string;
}

export async function editMessage({
  messageId,
  userId,
  content,
}: EditMessageInput) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  const message = await MessageModel.findById(new Types.ObjectId(messageId));
  if (!message) throw new Error("Message not found");

  if (message.deletedAt) {
    throw new Error("Cannot edit deleted message");
  }

  if (!message.senderId.equals(new Types.ObjectId(userId))) {
    throw new Error("Forbidden");
  }

  const editedAt = new Date();

  message.content = trimmed;
  message.editedAt = editedAt;
  await message.save();

  await updateLastMessageIfMatches(message.chatId, message._id, {
    content: trimmed,
    editedAt,
  });

  return {
    success: true,
  };
}
