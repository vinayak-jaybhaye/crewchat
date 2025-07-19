import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";
import { toUserDTO } from "@crewchat/utils/converters";

export async function getCurrentUser(): Promise<Session["user"] | null> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return null;
    }
    const user = toUserDTO(session.user);
    return user;
}   
