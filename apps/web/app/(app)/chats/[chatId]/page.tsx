import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatPageLayout } from "@/components/chat";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }>; }) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth");

  return (
    <ChatPageLayout
      chatId={chatId}
      currentUserId={session.user.mongoId}
    />
  );
}
