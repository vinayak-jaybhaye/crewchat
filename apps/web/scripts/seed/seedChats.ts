import chatData from "./data/chats.json";
import {
  UserModel,
  ChatModel,
  UserChatMetaDataModel,
} from "@crewchat/db";

export default async function seedChats() {
  const users = await UserModel.find();
  const byEmail = Object.fromEntries(users.map(u => [u.email, u]));

  const chatMap: Record<string, any> = {};

  // ---- Groups ----
  for (const group of chatData.groups) {
    const chat = await ChatModel.create({
      name: group.name,
      description: group.description,
      isGroup: true,
      members: group.members.map(e => byEmail[e]._id),
      lastMessage: null,
    });

    chatMap[group.key] = chat;

    for (const email of group.members) {
      await UserChatMetaDataModel.create({
        userId: byEmail[email]._id,
        chatId: chat._id,
        role: email === group.members[0] ? "owner" : "member",
      });
    }
  }

  // ---- DMs ----
  for (const [a, b] of chatData.dms) {
    const chat = await ChatModel.create({
      isGroup: false,
      members: [byEmail[a]._id, byEmail[b]._id],
      lastMessage: null,
    });

    const key = `dm:${a}:${b}`;
    chatMap[key] = chat;

    await UserChatMetaDataModel.insertMany([
      { userId: byEmail[a]._id, chatId: chat._id },
      { userId: byEmail[b]._id, chatId: chat._id },
    ]);
  }

  return chatMap;
}
