"use server";

import { createChat, getChats } from "@/lib/chat";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function startChat(userId1: string, userId2: string) {
    try {
        const chat = await createChat(userId1, userId2);
        return chat;
    } catch (error) {
        console.error("Error creating chat meta:", error);
        throw new Error("Failed to start chat");
    }
}

export async function fetchUserChats() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error("Unauthorized access to user chats");
        }
        const chats = await getChats(currentUser._id);
        return chats;
    } catch (error) {
        console.error("Error fetching user chats:", error);
        throw new Error("Failed to fetch chats");
    }
}
