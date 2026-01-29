import { NewChatClient } from "@/components/newchat";

export default async function Page({ params }: { params: Promise<{ userId: string }>; }) {
  const { userId } = await params;

  return <NewChatClient userId={userId} />;
}
