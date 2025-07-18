import { connectToDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { Chat, IChat } from "@crewchat/db";

export async function GET() {
    try {
        await connectToDB();
        const chats: IChat[] = await Chat.find().exec();

        return NextResponse.json(chats);
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const chatData = await request.json();
        const newChat = new Chat(chatData);
        await newChat.save();

        return NextResponse.json(newChat, { status: 201 });
    } catch (error) {
        console.error("Failed to create chat:", error);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { chatId } = await request.json();
        const deletedChat = await Chat.findByIdAndDelete(chatId);

        if (!deletedChat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Chat deleted successfully" });
    } catch (error) {
        console.error("Failed to delete chat:", error);
        return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { chatId, ...updateData } = await request.json();
        const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, { new: true });

        if (!updatedChat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json(updatedChat);
    } catch (error) {
        console.error("Failed to update chat:", error);
        return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
    }
}