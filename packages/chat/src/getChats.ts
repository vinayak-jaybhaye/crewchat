import { Types } from "mongoose";
import {
  ChatModel,
  UserChatMetaDataModel,
  UserModel,
  MessageModel,
} from "@crewchat/db";

interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface ChatPreview {
  id: string;
  isGroup: boolean;
  name: string;
  imageUrl: string | null;
  lastMessage: LastMessage | null;
  pinned: boolean;
  muted: boolean;
  unreadCount: number;
}

export interface MinimalChatPreview {
  id: string;
  isGroup: boolean;
  name: string;
  imageUrl: string | null;
  pinned: boolean;
  muted: boolean;
}

export async function getChats(userId: string): Promise<ChatPreview[]> {
  const userObjectId = new Types.ObjectId(userId);

  // Fetch metadata (authoritative per-user state)
  const metas = await UserChatMetaDataModel.find({
    userId: userObjectId,
  })
    .sort({ pinned: -1, updatedAt: -1 })
    .lean();

  if (metas.length === 0) return [];

  const chatIds = metas.map(m => m.chatId);

  // Fetch chats
  const chats = await ChatModel.find({
    _id: { $in: chatIds },
  }).sort({ pinned: -1, updatedAt: -1 }).lean();

  const chatMap = new Map(
    chats.map(c => [c._id.toString(), c])
  );

  // Fetch all members for these chats
  const members = await UserChatMetaDataModel.find({
    chatId: { $in: chatIds },
  }).lean();

  const membersByChat = new Map<string, typeof members>();

  for (const m of members) {
    const key = m.chatId.toString();
    if (!membersByChat.has(key)) membersByChat.set(key, []);
    membersByChat.get(key)!.push(m);
  }

  // Fetch all users involved (for DMs)
  const userIds = new Set<string>();
  for (const m of members) {
    userIds.add(m.userId.toString());
  }

  const users = await UserModel.find({
    _id: { $in: Array.from(userIds).map(id => new Types.ObjectId(id)) },
  }).lean();

  const userMap = new Map(
    users.map(u => [u._id.toString(), u])
  );

  const unreadAgg = await MessageModel.aggregate([
    // Only candidate messages
    {
      $match: {
        chatId: { $in: chatIds },
        senderId: { $ne: userObjectId },
        deletedAt: null,
      },
    },

    // Join per-user chat metadata
    {
      $lookup: {
        from: "userchatmetadatas", // collection name
        let: { chatId: "$chatId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$chatId", "$$chatId"] },
                  { $eq: ["$userId", userObjectId] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              lastSeen: 1,
              lastDeleted: 1,
            },
          },
        ],
        as: "meta",
      },
    },

    // Flatten meta array
    { $unwind: "$meta" },

    // Compute cutoff = max(lastSeen, lastDeleted)
    {
      $addFields: {
        cutoff: {
          $max: ["$meta.lastSeen", "$meta.lastDeleted"],
        },
      },
    },

    // Keep only unread messages
    {
      $match: {
        $expr: {
          $gt: ["$createdAt", "$cutoff"],
        },
      },
    },

    // Count per chat
    {
      $group: {
        _id: "$chatId",
        count: { $sum: 1 },
      },
    },
  ]);


  const unreadCountMap = new Map(
    unreadAgg.map(u => [u._id.toString(), u.count])
  );

  // Build chat previews
  return metas
    .map(meta => {
      const chat = chatMap.get(meta.chatId.toString());
      if (!chat) return null;

      let name = chat.name ?? "Unnamed Group";
      let imageUrl: string | null = chat.imageUrl ?? null;

      // Resolve DM name & image
      if (!chat.isGroup) {
        const members = membersByChat.get(chat._id.toString()) ?? [];
        const other = members.find(
          m => m.userId.toString() !== userId
        );

        if (other) {
          const otherUser = userMap.get(other.userId.toString());
          if (otherUser) {
            name = otherUser.username;
            imageUrl = otherUser.avatarUrl ?? null;
          }
        }
      }

      return {
        id: chat._id.toString(),
        isGroup: chat.isGroup,
        name,
        imageUrl,
        lastMessage: chat.lastMessage && chat.lastMessage._id
          ? {
            id: chat.lastMessage._id.toString(),
            content: chat.lastMessage.content,
            senderId: chat.lastMessage.senderId.toString(),
            deletedAt: chat.lastMessage.deletedAt,
            createdAt: chat.lastMessage.createdAt,
          }
          : null,
        pinned: meta.pinned,
        muted: meta.muted,
        unreadCount: unreadCountMap.get(chat._id.toString()) ?? 0,
      };
    })
    .filter(Boolean) as ChatPreview[];
}

export async function getChatPreviewById(chatId: string, userId: string): Promise<MinimalChatPreview> {
  // check if chat exists
  const chat = await ChatModel.findById(chatId).lean();
  if (!chat) throw new Error("Chat not found");

  // check if user is in chat
  const member = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (!member) throw new Error("User not in chat");

  // if it is not group chat, update name and image 
  if (!chat.isGroup) {
    const otherMemberId = chat.members.find(m => m.toString() !== userId);
    if (otherMemberId) {
      const otherUser = await UserModel.findById(otherMemberId).lean();
      if (!otherUser) throw new Error("Other user not found");
      chat.name = otherUser.username;
      chat.imageUrl = otherUser.avatarUrl ?? null;
    }
  }

  return {
    id: chat._id.toString(),
    isGroup: chat.isGroup,
    name: chat.name,
    imageUrl: chat.imageUrl,
    pinned: member.pinned,
    muted: member.muted
  };
}
