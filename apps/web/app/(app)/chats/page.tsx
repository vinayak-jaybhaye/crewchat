import ChatList from "@/components/chat/ChatList";
import EmptyChatState from "@/components/chat/EmptyChatState";

export default function ChatsPage() {
  return (
    <>
      <div className="hidden md:flex h-full w-full items-center justify-center">
        <EmptyChatState />
      </div>

      <div className="h-full w-full flex flex-col md:hidden bg-pink-400">
        <div className="flex-1 w-full overflow-y-auto bg-red-400">
          <ChatList />
        </div>
      </div>
    </>
  );
}
