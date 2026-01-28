import { UserModel } from "@crewchat/db";

export interface CreateUserInput {
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface CreateUserResponse {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export async function createUser(input: CreateUserInput): Promise<CreateUserResponse> {
  const user = await UserModel.create({
    username: input.username.trim(),
    email: input.email.toLowerCase(),
    avatarUrl: input.avatarUrl,
  });

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
