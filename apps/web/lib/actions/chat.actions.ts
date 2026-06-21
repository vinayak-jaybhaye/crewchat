"use server";

import { auth } from "@/auth";
import { connectToDB } from "@crewchat/db";
import {
  createDM, getChats, getChatPreviewById, getChatDetails, getChatMembers,
  togglePin, toggleMute, markChatAsRead, createGroup, DMExists,
  changeMemberRole, removeMember, addMembers, leaveGroup
} from "@crewchat/chat";
import { ChatPreviewDTO, ChatDetailsDTO, ChatMemberDTO, MinimalChatPreviewDTO } from "@/lib/types/chat.types";
import { publishChatJoin, publishChatJoinMany, publishChatLeave } from "@/lib/userEvents";
import {
  ObjectIdSchema, BooleanSchema, MemberRoleSchema,
  CreateGroupInputSchema, AddMembersInputSchema,
} from "@/lib/validation/schemas";
import { rateLimitCreateChat } from "@/lib/rateLimit";

export async function createDMAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validatedId = ObjectIdSchema.parse(otherUserId);

  // Rate limit: 5 chat creations per minute per user
  await rateLimitCreateChat(session.user.mongoId);

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await createDM({
    userId: session.user.mongoId,
    otherUserId: validatedId,
  });

  await publishChatJoinMany([session.user.mongoId, validatedId], chatId);

  return chatId;
}

export async function DMExistsAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validatedId = ObjectIdSchema.parse(otherUserId);

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await DMExists(session.user.mongoId, validatedId);

  return chatId;
}


export async function createGroupAction(input: {
  name: string, memberIds: string[], imageUrl: string | null, description: string
}): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = CreateGroupInputSchema.parse(input);

  // Rate limit: 5 chat creations per minute per user
  await rateLimitCreateChat(session.user.mongoId);

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await createGroup({
    ownerId: session.user.mongoId,
    name: validated.name,
    memberIds: validated.memberIds,
    imageUrl: validated.imageUrl ?? undefined,
    description: validated.description,
  });

  await publishChatJoinMany([session.user.mongoId, ...validated.memberIds], chatId);

  return chatId;
}

export async function getChatsAction(): Promise<ChatPreviewDTO[]> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const chats = await getChats(session.user.mongoId);

  return chats.map(chat => ({
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.name,
    imageUrl: chat.imageUrl ?? null,
    pinned: chat.pinned,
    muted: chat.muted,
    unreadCount: chat.unreadCount,
    lastMessage: chat.lastMessage
      ? {
        id: chat.lastMessage.id,
        content: chat.lastMessage.content,
        senderId: chat.lastMessage.senderId,
        deletedAt: chat.lastMessage.deletedAt
          ? chat.lastMessage.deletedAt.toISOString()
          : null,
        createdAt: chat.lastMessage.createdAt.toISOString(),
      }
      : null,
  }));
}

export async function getChatPreviewByIdAction(chatId: string): Promise<MinimalChatPreviewDTO> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatPreviewById(validatedChatId, session.user.mongoId);

  return {
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.name,
    imageUrl: chat.imageUrl ?? null,
    pinned: chat.pinned,
    muted: chat.muted,
  };
}

export async function getChatDetailsByIdAction(chatId: string): Promise<ChatDetailsDTO> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatDetails(validatedChatId, session.user.mongoId);

  return {
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.name ?? "Chat",
    imageUrl: chat.imageUrl ?? null,
    description: chat.description ?? "",
    role: chat.role,
    muted: chat.muted,
    createdAt: chat.createdAt.toISOString(),
    otherMemberDetails: chat.otherMemberDetails
      ? {
        id: chat.otherMemberDetails.id,
        username: chat.otherMemberDetails.username,
        avatarUrl: chat.otherMemberDetails.avatarUrl ?? undefined,
        email: chat.otherMemberDetails.email,
        lastActive: chat.otherMemberDetails.lastActive.toISOString(),
      }
      : undefined,

  };
}

export async function getChatMembersByIdAction(chatId: string): Promise<ChatMemberDTO[]> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatMembers({chatId: validatedChatId, userId: session.user.mongoId});


  return chat.map(member => ({
    id: member.id,
    username: member.username,
    avatarUrl: member.avatarUrl ?? null,
    email: member.email,
    role: member.role,
  }));
}

export async function togglePinAction(chatId: string, pinned: boolean) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);
  const validatedPinned = BooleanSchema.parse(pinned);

  await connectToDB(process.env.MONGODB_URI!);

  await togglePin(session.user.mongoId, validatedChatId, validatedPinned);
  return { success: true };
}

export async function toggleMuteAction(chatId: string, muted: boolean) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);
  const validatedMuted = BooleanSchema.parse(muted);

  await connectToDB(process.env.MONGODB_URI!);

  await toggleMute(session.user.mongoId, validatedChatId, validatedMuted);
  return { success: true };
}

export async function markChatAsReadAction(chatId: string) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);

  await connectToDB(process.env.MONGODB_URI!);

  await markChatAsRead(session.user.mongoId, validatedChatId);
  return { success: true };
}

export async function changeMemberRoleAction(chatId: string, userId: string, role: "admin" | "member") {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);
  const validatedUserId = ObjectIdSchema.parse(userId);
  const validatedRole = MemberRoleSchema.parse(role);

  await connectToDB(process.env.MONGODB_URI!);

  await changeMemberRole(validatedChatId, session.user.mongoId, validatedUserId, validatedRole);
  return { success: true };
}

export async function removeMemberAction(chatId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);
  const validatedUserId = ObjectIdSchema.parse(userId);

  await connectToDB(process.env.MONGODB_URI!);

  const result = await removeMember({
    chatId: validatedChatId,
    actorId: session.user.mongoId,
    userIdToRemove: validatedUserId,
  });

  if (result.removed) {
    await publishChatLeave(validatedUserId, validatedChatId);
  }

  return { success: true };
}

export async function addMembersAction(chatId: string, userIds: string[]) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validated = AddMembersInputSchema.parse({ chatId, userIds });

  await connectToDB(process.env.MONGODB_URI!);

  const result = await addMembers({
    chatId: validated.chatId,
    actorId: session.user.mongoId,
    userIdsToAdd: validated.userIds,
  });

  if (result.addedUserIds.length > 0) {
    await publishChatJoinMany(result.addedUserIds, validated.chatId);
  }

  return { success: true };
}

export async function leaveGroupAction(chatId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  const validatedChatId = ObjectIdSchema.parse(chatId);

  await connectToDB(process.env.MONGODB_URI!);

  const result = await leaveGroup({
    chatId: validatedChatId,
    userId: session.user.mongoId,
  });

  if (result.left) {
    await publishChatLeave(session.user.mongoId, validatedChatId);
  }

  return true;
}