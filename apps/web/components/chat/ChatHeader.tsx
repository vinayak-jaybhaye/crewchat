import Link from "next/link";
import { MinimalChatPreviewDTO } from "@/lib/types/chat.types";
import { ArrowLeft } from "lucide-react";
import ProfilePic from "@/components/user/ProfilePic";

export default function ChatHeader({ chat, setIsAboutChatOpen }: { chat: MinimalChatPreviewDTO, setIsAboutChatOpen: (open: boolean) => void }) {
    // loading state
    if (!chat) {
        return (
            <div className="flex items-center justify-start px-4 py-2 bg-surface-default border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-muted animate-pulse" />
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-24 bg-muted animate-pulse" />
                        <div className="h-3 w-16 bg-muted animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-center justify-start px-4 py-2 bg-surface-default border-b border-border-subtle">
            {/* back button */}
            <Link href="/chats" className="md:hidden p-2 -ml-2 text-text-primary hover:scale-110 transition-all">
                <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-3">
                <ProfilePic size={40} src={chat.imageUrl} name={chat.name} />
                <div>
                    <h2 className="text-sm font-medium text-text-primary cursor-pointer"
                        onClick={() => setIsAboutChatOpen(prev => !prev)} >
                        {chat.name}
                    </h2>
                    <p className="text-xs text-text-secondary">Online</p>
                </div>
            </div>
        </div>
    )
}