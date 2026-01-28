import { ChatModel } from "@crewchat/db";
import { Types } from "mongoose";

export async function updateLastMessageIfMatches(
  chatId: Types.ObjectId,
  messageId: Types.ObjectId,
  patch: {
    content?: string | null;
    editedAt?: Date | null;
    deletedAt?: Date | null;
  },
) {
  const chat = await ChatModel.findById(chatId).lean();
  if (!chat?.lastMessage) return;

  if (!chat.lastMessage._id.equals(messageId)) return;

  const update: Record<string, any> = {};

  if ("content" in patch) {
    update["lastMessage.content"] = patch.content;
  }
  if ("editedAt" in patch) {
    update["lastMessage.editedAt"] = patch.editedAt;
  }
  if ("deletedAt" in patch) {
    update["lastMessage.deletedAt"] = patch.deletedAt;
  }

  if (Object.keys(update).length === 0) return;

  await ChatModel.updateOne({ _id: chatId }, { $set: update });
}
