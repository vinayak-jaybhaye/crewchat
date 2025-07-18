import NextAuth, { type NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User as UserModel } from "@crewchat/db";
import type { User, Session } from "next-auth";
import { connectToDB } from "@/lib/db";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

declare module "next-auth" {
    interface Session {
        user: {
            _id: string;
            email: string;
            username: string;
            avatarUrl?: string;
            image?: string;
        } & DefaultSession["user"];
    }
}


if (!NEXTAUTH_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing environment variables for NextAuth configuration");
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: User }) {
            await connectToDB();

            const existingUser = await UserModel.findOne({ email: user.email });

            if (!existingUser) {
                const baseUsername =
                    user.name?.replace(/\s+/g, "").toLowerCase() ||
                    user.email?.split("@")[0] ||
                    "user";

                let uniqueUsername = baseUsername;
                let suffix = 0;

                while (await UserModel.findOne({ username: uniqueUsername })) {
                    if (suffix > 6) {
                        uniqueUsername = user.email!;
                        break;
                    }
                    const randomDigit = Math.floor(Math.random() * 10);
                    uniqueUsername = `${uniqueUsername}${randomDigit}`;
                    suffix++;
                }

                await UserModel.create({
                    username: uniqueUsername,
                    email: user.email,
                    avatarUrl: user.image,
                });
            }

            return true;
        },

        async session({ session }: { session: Session }) {
            if (!session.user?.email) return session;

            const dbUser = await UserModel.findOne({ email: session.user.email });

            if (dbUser) {
                session.user._id = dbUser._id.toString();
                session.user.username = dbUser.username;
                session.user.avatarUrl = dbUser.avatarUrl || session.user.image;
            }

            return session;
        },
    },
    secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
