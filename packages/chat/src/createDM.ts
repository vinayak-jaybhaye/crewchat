import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface CreateDMInput {
  userId: string;
  otherUserId: string;
}

export async function createDM({ userId, otherUserId }: CreateDMInput) {
  if (userId === otherUserId) {
    throw new Error("Cannot create DM with yourself");
  }

  // Check if DM already exists
  const existing = await ChatModel.findOne({
    isGroup: false,
    members: {
      $all: [
        new Types.ObjectId(userId),
        new Types.ObjectId(otherUserId),
      ],
      $size: 2,
    },
  });

  if (existing) {
    return existing.chatId.toString();
  }

  // Create chat
  const chat = await ChatModel.create({
    isGroup: false,
    members: [new Types.ObjectId(userId), new Types.ObjectId(otherUserId)]
  });

  // Create metadata for both users
  await UserChatMetaDataModel.insertMany([
    {
      chatId: chat._id,
      userId: new Types.ObjectId(userId),
      role: "member",
    },
    {
      chatId: chat._id,
      userId: new Types.ObjectId(otherUserId),
      role: "member",
    },
  ]);

  return chat._id.toString();
}

export async function DMExists(userId: string, otherUserId: string) {
  const existing = await ChatModel.findOne({
    isGroup: false,
    members: {
      $all: [
        new Types.ObjectId(userId),
        new Types.ObjectId(otherUserId),
      ],
      $size: 2,
    },
  });

  if(existing) {
    return existing._id.toString();
  }

  return null;
}