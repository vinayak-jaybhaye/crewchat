'use server';

import { createChat, getChats, getChatDetails, getUserChatMetadata } from "@/lib/chat";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ChatDetails } from "@/lib/chat/getChatDetails";
import { redirect } from "next/navigation";
import { connectToDB } from "@/lib/db";

export async function startChat(userId: string) {
    await connectToDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/login");
    }
    const chat = await createChat(userId, currentUser._id);
    return chat;
}

export async function fetchUserChats() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/login");
    }
    const chats = await getChats(currentUser._id);
    return chats;
}


export async function fetchChatData(chatId: string): Promise<ChatDetails | null> {
    try {
        console.log("Fetching chat data for chatId:", chatId);

        const currentUser = await getCurrentUser();

        if (!currentUser) {
            throw new Error("Unauthorized access to chat data");
        }

        const chat = await getChatDetails(chatId, currentUser._id);
        if (!chat) {
            throw new Error("Chat not found or access denied");
        }

        return chat;
    } catch (error) {
        console.error("Error fetching chat data:", error);
        throw new Error("Failed to fetch chat data");
    }
}


export async function fetchUserChatMetaData(chatId: string) {
    try {
        await connectToDB();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            redirect("/login");
            return null;
        }

        return await getUserChatMetadata(chatId, currentUser._id);
    } catch (error) {
        console.error("Error fetching chat members:", error);
        throw new Error("Failed to fetch chat members");
    }
}