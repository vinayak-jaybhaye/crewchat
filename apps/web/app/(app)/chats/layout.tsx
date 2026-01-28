import type { ReactNode } from "react";
import ChatList from "@/components/chat/ChatList";

export default function ChatsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:grid h-full w-full grid-cols-[1fr] md:grid-cols-[320px_1fr] lg:grid-cols-[400px_1fr]">
        <aside className="border-r border-neutral-800">
          <ChatList />
        </aside>
        <main className="relative overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile */}
      <div className="md:hidden h-full w-full">{children}</div>
    </div>
  );
}
