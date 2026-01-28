import { Types } from "mongoose";
import { UserModel } from "@crewchat/db";

export interface GetUserByIdResponse {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  lastActive?: Date;
}

export async function getUserById(
  userId: string,
): Promise<GetUserByIdResponse | null> {
  const user = await UserModel.findById(new Types.ObjectId(userId)).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    lastActive: user.lastActive,
  };
}
