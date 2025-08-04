import { connectToDB } from "@/lib/db";
import { User } from "@crewchat/db";

export async function checkUsernameExists({ username }: { username: string }) {
    try {
        await connectToDB();

        const existingUser = await User.findOne({ username });

        return !!existingUser; // returns true if user exists, false otherwise
    } catch (error) {
        console.error("Error checking username:", error);
        return false;
    }
}
