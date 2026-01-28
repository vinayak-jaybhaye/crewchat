import { Types } from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface CreateGroupInput {
  ownerId: string;
  name: string;
  imageUrl: string;
  memberIds: string[];
}

export async function createGroup({
  ownerId,
  name,
  imageUrl,
  memberIds,
}: CreateGroupInput) {
  if (!name.trim()) {
    throw new Error("Group name required");
  }

  const uniqueMembers = Array.from(
    new Set(
      memberIds.filter((id) => id !== ownerId).map((id) => id.toString()),
    ),
  ).map((id) => new Types.ObjectId(id));

  const chat = await ChatModel.create({
    isGroup: true,
    name,
    imageUrl,
  });

  const metaDocs = [
    {
      chatId: chat._id,
      userId: new Types.ObjectId(ownerId),
      role: "admin",
    },
    ...uniqueMembers.map((id) => ({
      chatId: chat._id,
      userId: id,
      role: "member",
    })),
  ];

  await UserChatMetaDataModel.insertMany(metaDocs);

  return chat._id.toString();
}
