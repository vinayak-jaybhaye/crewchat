"use client";

import { useRouter } from "next/navigation";
import { startChat } from "@/app/actions/ChatActions";

interface StartChatButtonProps {
    currentUserId: string;
    otherUserId: string;
}

export function StartChatButton({ currentUserId, otherUserId }: StartChatButtonProps) {
    const router = useRouter();

    async function handleStartChat() {
        const chat = await startChat(currentUserId, otherUserId);
        if (!chat) {
            console.error("Failed to start chat");
            return;
        }
        router.push("/chats/" + chat._id);
    }

    return (
        <button onClick={handleStartChat}>Start Chatting</button>
    );
}
