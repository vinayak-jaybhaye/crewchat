import { Types } from "mongoose";
import mongoose from "mongoose";
import { ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface CreateDMInput {
  userId: string;
  otherUserId: string;
}

/**
 * Find an existing DM between two users by querying UserChatMetaData.
 * This is the single source of truth for membership.
 */
async function findExistingDM(userId: string, otherUserId: string): Promise<string | null> {
  // Find all non-group chat IDs where userId is a member
  const userChatMetas = await UserChatMetaDataModel.find({
    userId: new Types.ObjectId(userId),
  })
    .select("chatId")
    .lean();

  if (userChatMetas.length === 0) return null;

  const chatIds = userChatMetas.map((m) => m.chatId);

  // Find chats among those that are DMs (isGroup: false)
  const dmChats = await ChatModel.find({
    _id: { $in: chatIds },
    isGroup: false,
  })
    .select("_id")
    .lean();

  if (dmChats.length === 0) return null;

  const dmChatIds = dmChats.map((c) => c._id);

  // Check which of these DMs also has the other user as a member
  const sharedMembership = await UserChatMetaDataModel.findOne({
    userId: new Types.ObjectId(otherUserId),
    chatId: { $in: dmChatIds },
  })
    .select("chatId")
    .lean();

  return sharedMembership ? sharedMembership.chatId.toString() : null;
}

export async function createDM({ userId, otherUserId }: CreateDMInput) {
  if (userId === otherUserId) {
    throw new Error("Cannot create DM with yourself");
  }

  // Check if DM already exists using UserChatMetaData (source of truth)
  const existingChatId = await findExistingDM(userId, otherUserId);
  if (existingChatId) {
    return existingChatId;
  }

  // Use a transaction to atomically create Chat + UserChatMetaData
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [chat] = await ChatModel.create(
      [{ isGroup: false }],
      { session },
    );

    await UserChatMetaDataModel.insertMany(
      [
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
      ],
      { session },
    );

    await session.commitTransaction();
    return chat._id.toString();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function DMExists(userId: string, otherUserId: string) {
  return findExistingDM(userId, otherUserId);
}