"use server";

import { connectToDB } from "@crewchat/db";
import { sendMessage, getMessages, editMessage, deleteMessage } from "@crewchat/message";
import { MessageDTO } from "@/lib/types/message.types";
import { auth } from "@/auth";

import { redis } from "@/lib/redis";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function sendMessageAction(chatId: string, content: string) {
  const user = await requireUser();
  await connectToDB(process.env.MONGODB_URI!);

  const message = await sendMessage({
    chatId: chatId,
    senderId: user.mongoId,
    content,
  });

  const newMessage: MessageDTO = {
    messageId: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt
      ? message.editedAt.toISOString()
      : null,
    deletedAt: message.deletedAt
      ? message.deletedAt.toISOString()
      : null,
  };

  // emit message to chat room
  await redis.publish(
    "chat:events",
    JSON.stringify({
      chatId: chatId,
      type: "message:new",
      message: newMessage,
    })
  );

  return newMessage;
}

export async function getMessagesAction({ chatId, cursor, limit }: { chatId: string, cursor?: string, limit?: number }): Promise<MessageDTO[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const messages = await getMessages({
    chatId: chatId,
    userId: session.user.mongoId,
    limit: limit || 30,
    cursor: cursor ? new Date(cursor) : undefined,
  });

  // oldest first
  messages.reverse();

  return messages.map((msg) => ({
    messageId: msg.id,
    chatId: msg.chatId,
    senderId: msg.senderId,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    editedAt: msg.editedAt ? msg.editedAt.toISOString() : null,
    deletedAt: msg.deletedAt ? msg.deletedAt.toISOString() : null,
  }));
}

export async function editMessageAction(messageId: string, content: string, chatId: string) {
  const user = await requireUser();
  await connectToDB(process.env.MONGODB_URI!);

  await editMessage({
    messageId: messageId,
    content: content,
    userId: user.mongoId,
  });

  // emit message to chat room
  await redis.publish(
    "chat:events",
    JSON.stringify({
      type: "message:edit",
      chatId: chatId,
      messageId: messageId,
      content: content
    })
  );

  return messageId;
}

export async function deleteMessageAction(messageId: string, chatId: string) {
  const user = await requireUser();
  await connectToDB(process.env.MONGODB_URI!);

  const message = await deleteMessage({
    messageId: messageId,
    userId: user.mongoId,
  });

  // emit message to chat room
  await redis.publish(
    "chat:events",
    JSON.stringify({
      type: "message:delete",
      chatId: chatId,
      messageId: messageId,
    })
  );

  return messageId;
}
