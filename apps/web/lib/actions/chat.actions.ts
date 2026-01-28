"use server";

import { auth } from "@/auth";
import { connectToDB } from "@crewchat/db";
import {
  createDM, getChats, getChatPreviewById, getChatDetails, getChatMembers,
  togglePin, toggleMute, markChatAsRead, createGroup, DMExists,
  changeMemberRole, removeMember
} from "@crewchat/chat";
import { ChatPreviewDTO, ChatDetailsDTO, ChatMemberDTO, MinimalChatPreviewDTO } from "@/lib/types/chat.types";

export async function createDMAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await createDM({
    userId: session.user.mongoId,
    otherUserId: otherUserId,
  });

  return chatId;
}

export async function DMExistsAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await DMExists(session.user.mongoId, otherUserId);

  return chatId;
}


export async function createGroupAction(name: string, memberIds: string[], imageUrl: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const chatId = await createGroup({
    ownerId: session.user.mongoId,
    name,
    memberIds,
    imageUrl,
  });

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
        username: chat.lastMessage.username,
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

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatPreviewById(chatId, session.user.mongoId);

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

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatDetails(chatId, session.user.mongoId);

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
        avatarUrl: chat.otherMemberDetails.avatarUrl ?? null,
        email: chat.otherMemberDetails.email,
        lastActive: chat.otherMemberDetails.lastActive?.toISOString(),
      }
      : undefined,
  };
}

export async function getChatMembersByIdAction(chatId: string): Promise<ChatMemberDTO[]> {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  const chat = await getChatMembers(chatId, session.user.mongoId);


  return chat.map(member => ({
    id: member.id,
    username: member.username,
    avatarUrl: member.avatarUrl ?? null,
    email: member.email,
    lastActive: member.lastActive?.toISOString(),
    role: member.role,
  }));
}

export async function togglePinAction(chatId: string, pinned: boolean) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await togglePin(session.user.mongoId, chatId, pinned);
  return { success: true };
}

export async function toggleMuteAction(chatId: string, muted: boolean) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await toggleMute(session.user.mongoId, chatId, muted);
  return { success: true };
}

export async function markChatAsReadAction(chatId: string) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await markChatAsRead(session.user.mongoId, chatId);
  return { success: true };
}

export async function changeMemberRoleAction(chatId: string, userId: string, role: "admin" | "member") {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await changeMemberRole(chatId, session.user.mongoId, userId, role);
  return { success: true };
}

export async function removeMemberAction(chatId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.mongoId) throw new Error("Unauthorized");

  await connectToDB(process.env.MONGODB_URI!);

  await removeMember({
    chatId,
    actorId: session.user.mongoId,
    userIdToRemove: userId,
  });
  return { success: true };
}
