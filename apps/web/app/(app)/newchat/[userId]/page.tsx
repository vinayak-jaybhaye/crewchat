import NewChatClient from "@/components/chat/NewChatClient";

export default async function Page({ params }: { params: Promise<{ userId: string }>; }) {
  const { userId } = await params;

  return <NewChatClient userId={userId} />;
}
