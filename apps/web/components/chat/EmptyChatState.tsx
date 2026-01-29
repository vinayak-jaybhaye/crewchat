import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default function EmptyChatState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-text-primary bg-surface-subtle">
      <div className="relative mb-6">
        <Link
          href="/newchat"
          className="inline-flex items-center gap-2 p-2"
        >
          <MessageSquarePlus className="h-10 w-10" strokeWidth={1.5} />
        </Link>
      </div>
      <h3 className="text-xl text-text-primary font-semibold tracking-tight">Select a conversation</h3>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Select a chat from the sidebar to start messaging or create a new one.
      </p>
    </div>
  );
}
