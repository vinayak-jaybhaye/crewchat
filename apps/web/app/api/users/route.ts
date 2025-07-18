import { connectToDB } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { IUser, User } from "@crewchat/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userid");

    try {
        await connectToDB();

        // If a specific user is requested
        if (userId) {
            const user = await User.findById(userId).lean<IUser>();

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            return NextResponse.json({
                id: user._id,
                name: user.username,
                email: user.email,
            });
        }

        // If no userid, return all users
        const users = await User.find().lean<IUser[]>();
        return NextResponse.json(
            users.map(user => ({
                id: user._id,
                name: user.username,
                email: user.email,
            }))
        );
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const userData = await request.json();
        const newUser = new User(userData);
        await newUser.save();

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Failed to create user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { userId } = await request.json();
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { userId, ...updateData } = await request.json();
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
} 