import { Types } from "mongoose";
import mongoose from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface CreateGroupInput {
  ownerId: string;
  name: string;
  imageUrl?: string;
  description: string;
  memberIds: string[];
}

export async function createGroup({
  ownerId,
  name,
  imageUrl,
  description,
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

  // Use a transaction to atomically create Chat + UserChatMetaData
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [chat] = await ChatModel.create(
      [
        {
          isGroup: true,
          name,
          imageUrl,
          description,
        },
      ],
      { session },
    );

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

    await UserChatMetaDataModel.insertMany(metaDocs, { session });

    await session.commitTransaction();
    return chat._id.toString();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
