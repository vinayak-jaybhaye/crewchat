"use client";

import { useRouter } from "next/navigation";
import { startChat } from "@/app/actions/ChatActions";
import { useTransition } from "react";

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
            onClick={handleStartChat}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
        >
            {isPending ? "Starting..." : "Start Chatting"}
        </button>
    );
}
