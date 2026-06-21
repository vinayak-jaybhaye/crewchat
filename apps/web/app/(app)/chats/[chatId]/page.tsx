import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatPageLayout } from "@/components/chat";
import { getChatPreviewByIdAction } from "@/lib/actions/chat.actions";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }>; }) {
  const { chatId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/");

  try {
    // Assert user membership in the requested chat on the server
    await getChatPreviewByIdAction(chatId);
  } catch {
    // Gracefully redirect user to chat landing page if not a member or if chat doesn't exist
    redirect("/chats");
  }

  return (
    <ChatPageLayout
      chatId={chatId}
      currentUserId={session.user.mongoId}
    />
  );
}
