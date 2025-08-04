"use client";

import { useRouter } from "next/navigation";
import { startChat } from "@/app/actions/ChatActions";
import { useTransition } from "react";
import { MessageSquareMore } from 'lucide-react'

export function StartChatButton({ userId }: { userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleStartChat = () => {
        startTransition(async () => {
            try {
                console.log("Starting chat with userId:", userId);
                const chat = await startChat(userId);
                console.log("Chat started:", chat);
                if (!chat) {
                    console.error("Failed to start chat");
                    return;
                }
                router.push("/chats/" + chat._id);
            } catch (error) {
                console.error("Error starting chat:", error);
            }
        });
    };

    return (
        <button
            title="Message"
            onClick={handleStartChat}
            disabled={isPending}
            className="px-4 cursor-pointer py-2 bg-[var(--secondary)] text-[var(--text)] rounded-md hover:bg-blue-700 transition-all"
        >
            {isPending ? "Loading..." : (<MessageSquareMore />)}
        </button>
    );
}
