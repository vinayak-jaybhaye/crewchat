import { MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default function EmptyChatState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-bg-app relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-accent-tertiary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Icon container with subtle glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-accent-primary/10 rounded-full blur-xl scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-surface-raised border border-border-subtle flex items-center justify-center shadow-lg">
            <MessageSquarePlus className="h-9 w-9 text-accent-primary" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-xl text-text-primary font-bold tracking-tight">
          Select a conversation
        </h3>
        <p className="mt-2 text-sm text-text-muted max-w-xs leading-relaxed">
          Choose a chat from the sidebar to start messaging, or create a new conversation.
        </p>

        <Link
          href="/newchat"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-text-inverse text-sm font-semibold
                     shadow-md shadow-accent-primary/20
                     hover:shadow-lg hover:shadow-accent-primary/30 hover:-translate-y-0.5
                     active:translate-y-0 active:scale-[0.98]
                     transition-all duration-200"
        >
          <MessageSquarePlus size={16} />
          New Chat
        </Link>
      </div>
    </div>
  );
}
