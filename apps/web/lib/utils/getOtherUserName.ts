import { auth } from "@/auth";

export default async function getOtherUserName(members: { userId: string; name: string }[]) {
  const session = await auth();
  if (!session?.user) return "Unknown User";
  const currentUserId = session.user?.mongoId;
  const otherUser = members.find(member => member.userId !== currentUserId);
  return otherUser ? otherUser.name : "Unknown User";
}