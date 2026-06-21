import mongoose, { Types } from "mongoose";
import { MessageModel, ChatModel, UserChatMetaDataModel } from "@crewchat/db";

export interface SendMessageInput {
  chatId: string;
  senderId: string;
  content: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
}

export async function sendMessage({
  chatId,
  senderId,
  content,
}: SendMessageInput): Promise<Message> {
  // Validate content
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Message content cannot be empty");
  }
  if (trimmed.length > 2000) {
    throw new Error("Message too long");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Permission check (membership)
    const meta = await UserChatMetaDataModel.findOne({
      chatId: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(senderId),
    }).session(session).lean();

    if (!meta) {
      throw new Error("User is not a member of this chat");
    }

    // Create message
    const [message] = await MessageModel.create(
      [
        {
          chatId: new Types.ObjectId(chatId),
          senderId: new Types.ObjectId(senderId),
          content: trimmed,
        },
      ],
      { session }
    );

    // Update Chat.lastMessage snapshot
    await ChatModel.updateOne(
      { _id: new Types.ObjectId(chatId) },
      {
        $set: {
          lastMessage: {
            _id: message._id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            editedAt: null,
            deletedAt: null,
          },
          updatedAt: new Date(),
        },
      },
      { session }
    );

    // Increment unreadCount for all other members of the chat
    await UserChatMetaDataModel.updateMany(
      {
        chatId: new Types.ObjectId(chatId),
        userId: { $ne: new Types.ObjectId(senderId) },
      },
      {
        $inc: { unreadCount: 1 },
      },
      { session }
    );

    await session.commitTransaction();

    // ️Return message
    return {
      id: message._id.toString(),
      chatId: message.chatId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      createdAt: message.createdAt,
      editedAt: null,
      deletedAt: null,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
