import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel, UserModel } from "@crewchat/db";

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null;
  imageUrl?: string;
  description?: string;
  muted: boolean;
  role: "admin" | "member";
  createdAt: Date;
  otherMemberDetails?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    email: string;
    lastActive: Date;
  }
}

export async function getChatDetails(
  chatId: string,
  userId: string,
): Promise<Chat> {
  const chat = await ChatModel.findById(chatId).lean();
  if (!chat) throw new Error("Chat not found");

  // Check if user is a member of the chat
  const meta = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!meta) throw new Error("Forbidden");

  // if not group chat add other member details
  if (!chat.isGroup) {
    const otherMemberId = chat.members.find(
      (memberId) => memberId.toString() !== userId,
    );

    if (otherMemberId) {
      // Fetch other user's info
      const otherUser = await UserModel.findById(otherMemberId).lean();
      if (otherUser) {
        chat.name = otherUser.username;
        chat.imageUrl = otherUser.avatarUrl;
        chat.otherMemberDetails = {
          id: otherUser._id.toString(),
          username: otherUser.username,
          avatarUrl: otherUser.avatarUrl,
          email: otherUser.email,
          lastActive: otherUser.lastActive,
        };
      }
    }
  }

  return {
    id: chat._id.toString(),
    isGroup: chat.isGroup,
    name: chat.name ?? null,
    imageUrl: chat.imageUrl?.toString(),
    description: chat.description || "",
    muted: meta.muted,
    role: meta.role,
    createdAt: chat.createdAt,
    otherMemberDetails: chat.otherMemberDetails,
  };
}
