import { connectToDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { User } from "@crewchat/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ users: [] });
    }

    try {
        await connectToDB();

        const users = await User.find({
            $or: [
                { username: { $regex: `.*${query}.*`, $options: "i" } }, // match anywhere in username
                // {username: { $regex: `^${query}`, $options: "i" } }, // match prefix
                { email: { $regex: `^${query}`, $options: "i" } }
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