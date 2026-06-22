"use server";

import { withDB } from "@crewchat/db";
import { sendMessage, getMessages, editMessage, deleteMessage } from "@crewchat/message";
import { MessageDTO } from "@/lib/types/message.types";
import { auth } from "@/auth";

import { withAction } from "@/lib/errors";
import { publishEvent } from "@/lib/redis";
import { ObjectIdSchema, MessageContentSchema, GetMessagesInputSchema } from "@/lib/validation/schemas";
import { rateLimitSendMessage } from "@/lib/rateLimit";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export const sendMessageAction = withAction(
  withDB(async (chatId: string, content: string) => {
    const user = await requireUser();

    const validatedChatId = ObjectIdSchema.parse(chatId);
    const validatedContent = MessageContentSchema.parse(content);

    // Rate limit: 10 messages per 10 seconds per user
    await rateLimitSendMessage(user.mongoId);

    const message = await sendMessage({
      chatId: validatedChatId,
      senderId: user.mongoId,
      content: validatedContent,
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
    await publishEvent("chat:events", {
      chatId: validatedChatId,
      type: "message:new",
      message: newMessage,
    });

    return newMessage;
  })
);

export const getMessagesAction = withDB(async (input: { chatId: string, cursor?: string, limit?: number }): Promise<MessageDTO[]> => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = GetMessagesInputSchema.parse(input);

  const messages = await getMessages({
    chatId: validated.chatId,
    userId: session.user.mongoId,
    limit: validated.limit,
    cursor: validated.cursor ? new Date(validated.cursor) : undefined,
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
});

export const editMessageAction = withDB(async (messageId: string, content: string, chatId: string) => {
  const user = await requireUser();

  const validatedMessageId = ObjectIdSchema.parse(messageId);
  const validatedContent = MessageContentSchema.parse(content);
  const validatedChatId = ObjectIdSchema.parse(chatId);

  await editMessage({
    messageId: validatedMessageId,
    content: validatedContent,
    userId: user.mongoId,
  });

  // emit message to chat room
  await publishEvent("chat:events", {
    type: "message:edit",
    chatId: validatedChatId,
    messageId: validatedMessageId,
    content: validatedContent,
  });

  return validatedMessageId;
});

export const deleteMessageAction = withDB(async (messageId: string, chatId: string) => {
  const user = await requireUser();

  const validatedMessageId = ObjectIdSchema.parse(messageId);
  const validatedChatId = ObjectIdSchema.parse(chatId);

  const message = await deleteMessage({
    messageId: validatedMessageId,
    userId: user.mongoId,
  });

  // emit message to chat room
  await publishEvent("chat:events", {
    type: "message:delete",
    chatId: validatedChatId,
    messageId: validatedMessageId,
  });

  return validatedMessageId;
});
