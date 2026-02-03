import messageData from "./data/messages.json";
import { MessageModel, ChatModel, UserModel } from "@crewchat/db";

export default async function seedMessages(chatMap: Record<string, any>) {
  const users = await UserModel.find();
  const byEmail = Object.fromEntries(users.map(u => [u.email, u]));

  const now = Date.now();
  let offset = 0;

  async function createMessage(chatKey: string, senderId: any, content: string) {
    const message = await MessageModel.create({
      chatId: chatMap[chatKey]._id,
      senderId,
      content,
      createdAt: new Date(now + offset),
    });

    await ChatModel.updateOne(
      { _id: chatMap[chatKey]._id },
      {
        lastMessage: {
          _id: message._id,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
          editedAt: null,
          deletedAt: null,
        },
      }
    );

    offset += 60_000;
  }

  // ---- Group messages ----
  for (const msg of messageData.group) {
    await createMessage(
      "all",
      byEmail[msg.from]._id,
      msg.text
    );
  }

  // ---- DM messages ----
  for (const key of Object.keys(chatMap)) {
    if (!key.startsWith("dm:")) continue;

    const [, a, b] = key.split(":");

    for (const msg of messageData.dm) {
      const sender =
        msg.from === "A" ? byEmail[a]._id : byEmail[b]._id;

      await createMessage(key, sender, msg.text);
    }
  }
}
