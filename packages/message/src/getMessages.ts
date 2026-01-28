import { Types } from "mongoose";
import { MessageModel, UserChatMetaDataModel } from "@crewchat/db";

export interface GetMessagesInput {
  chatId: string;
  userId: string;
  limit: number;
  cursor?: Date; // createdAt cursor
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
}

export async function getMessages({
  chatId,
  userId,
  limit,
  cursor,
}: GetMessagesInput): Promise<Message[]> {
  // Permission check: user must be a chat member
  const meta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!meta) {
    throw new Error("Not a member of this chat");
  }

  // Build query
  const query: Record<string, any> = { chatId: new Types.ObjectId(chatId) };

  if (cursor) {
    query.createdAt = { $lt: cursor };
  }

  // Fetch messages
  const messages = await MessageModel.find(query)
    .sort({ createdAt: -1 }) // newest first
    .limit(limit)
    .lean();

  // Map to DTOs
  return messages.map((m) => ({
    id: m._id.toString(),
    chatId: m.chatId.toString(),
    senderId: m.senderId.toString(),
    content: m.deletedAt ? null : m.content,
    createdAt: m.createdAt,
    editedAt: m.editedAt ?? null,
    deletedAt: m.deletedAt ?? null,
  }));
}
