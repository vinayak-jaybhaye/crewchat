import { UserDTO } from "@crewchat/types";

export function toUserDTO(user: any): UserDTO {
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    createdAt: user.createdAt?.toISOString() || null,
    updatedAt: user.updatedAt?.toISOString() || null,
    lastSeen: user.lastSeen ? user.lastSeen.toISOString() : null,
  };
}
