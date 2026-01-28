import Link from "next/link";
import { MessageSquarePlus, Settings } from "lucide-react";

export default function ChatListHeader() {
    return (
        <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle bg-surface-raised shrink-0">
            <h1 className="text-xl font-bold text-text-primary">Crew Chat</h1>
            <div className="flex gap-2">
                <div className="flex gap-2">
                    <Link
                        href="/newchat"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm text-text-primary hover:scale-[0.95] transition-all"
                    >
                        <MessageSquarePlus className="h-5 w-5" strokeWidth={1.5} />
                    </Link>
                    <Link
                        href="/settings"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm text-text-primary hover:scale-[0.95] transition-all"
                    >
                        <Settings className="h-5 w-5" strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </div>
    )
}