import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { User as UserModel } from "@crewchat/db";
import { connectToDB } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        await connectToDB();

        const user = await UserModel.findOne({ email: session.user.email }).select("-__v");

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(user), { status: 200 });
    } catch (err) {
        console.error("Error in /api/me:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
