import { ChatList } from "@/components/chat";
import React from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[90vh] overflow-auto">
            {/* Sidebar (Chat List) */}
            <aside className="w-1/3 min-w-[250px] max-w-sm border-r border-gray-200 bg-white overflow-y-auto">
                <ChatList />
            </aside>

            {/* Main Content (ChatBox or Placeholder) */}
            <main className="flex-1 bg-gray-50 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
