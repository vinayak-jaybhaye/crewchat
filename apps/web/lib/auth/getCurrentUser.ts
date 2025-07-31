import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/options';
import { Session } from "next-auth";
import { toUserDTO } from "@crewchat/utils";

export async function getCurrentUser(): Promise<Session["user"] | null> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return null;
    }
    return toUserDTO(session.user);
}
