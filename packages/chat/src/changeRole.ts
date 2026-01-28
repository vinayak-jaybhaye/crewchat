import { Types } from "mongoose";
import { UserChatMetaDataModel } from "@crewchat/db";

export async function changeMemberRole(
  chatId: string,
  actorId: string,
  targetUserId: string,
  role: "admin" | "member",
) {
  const actor = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(actorId),
  }).lean();

  if (!actor || actor.role !== "admin") {
    throw new Error("Only admins can change roles");
  }

  const target = await UserChatMetaDataModel.findOne({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(targetUserId),
  });

  if (!target) throw new Error("User not in chat");

  if (target.role === "admin" && role === "member") {
    const adminCount = await UserChatMetaDataModel.countDocuments({
      chatId,
      role: "admin",
    });

    if (adminCount <= 1) {
      throw new Error("Cannot demote last admin");
    }
  }

  target.role = role;
  await target.save();

  return { updated: true };
}
