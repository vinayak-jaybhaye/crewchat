import { connectToDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { User } from "@crewchat/db";

function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ users: [] });
    }

    const safeQuery = escapeRegex(query.trim());

    try {
        await connectToDB();

        const users = await User.find({
            $or: [
                { username: { $regex: `.*${safeQuery}.*`, $options: "i" } }, // match anywhere in username
                // {username: { $regex: `^${safeQuery}`, $options: "i" } }, // match prefix
                { email: { $regex: `^${safeQuery}`, $options: "i" } }
            ]
        })
            .limit(10)
            .select("username avatarUrl _id");

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }
}