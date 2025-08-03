'use client';

import { ChatList } from "@/components/chat";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    const isChatSelected = pathname !== "/chats";

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return null;
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
        <div className="flex h-[90vh] overflow-auto">
            {/* Chat List (show only if not in chat or always on md+) */}
            {(!isMobile || !isChatSelected) && (
                <aside className="w-full md:w-1/4 min-w-[250px] border-r border-gray-200 bg-white overflow-y-auto">
                    <ChatList />
                </aside>
            )}

            {/* Chat Content (show only if in chat or always on md+) */}
            {(!isMobile || isChatSelected) && (
                <main className="flex-1 bg-[var(--background)] overflow-y-hidden px-1">
                    {children}
                </main>
            )}
        </div>
    );
}
