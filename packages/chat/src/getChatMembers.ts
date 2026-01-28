import { Types } from "mongoose";
import { UserChatMetaDataModel, UserModel } from "@crewchat/db";

export interface ChatMember {
  id: string;
  email: string
  username: string;
  avatarUrl?: string;
  role: "admin" | "member";

}

export async function getChatMembers(
  chatId: string
): Promise<ChatMember[]> {
  const members = await UserChatMetaDataModel.find({ chatId: new Types.ObjectId(chatId) })
    .select("userId role")
    .lean();

  // Fetch user details
  const userIds = members.map((m) => m.userId);
  const users = await UserModel.find({ _id: { $in: userIds } })
    .select("email username avatarUrl")
    .lean();

  const userMap = new Map<string, { email: string; username: string; avatarUrl?: string }>();
  users.forEach((user) => {
    userMap.set(user._id.toString(), {
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  });

  return members.map((member) => {
    const userDetails = userMap.get(member.userId.toString());
    return {
      id: member.userId.toString(),
      email: userDetails?.email || "",
      username: userDetails?.username || "",
      avatarUrl: userDetails?.avatarUrl,
      role: member.role,
    };
  });
}
