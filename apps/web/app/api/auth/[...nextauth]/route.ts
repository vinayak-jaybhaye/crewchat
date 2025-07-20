import NextAuth, { type NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { User as UserModel } from "@crewchat/db";
import type { User, Session } from "next-auth";
import { connectToDB } from "@/lib/db";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

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
        // Provider returns a user object 
        // user object is accessible in singIn and jwt callbacks


        // Inside signIn , access user object, do any custom logic and return true or false
        // If true, user is signed in, if false, sign in is aborted
        async signIn({ user }: { user: User }) {
            if (!user.email) {
                console.error("Sign-in attempt without email");
                return false;
            }
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
            } else {
                // Update existing user with latest info
                if (user.image && user.image !== existingUser.avatarUrl) {
                    existingUser.avatarUrl = user.image;
                    await existingUser.save();
                }
            }

            return true;
        },

        // In jwt callback arguments are token , user, account, profile, isNewUser
        // user, account, isNewUser are only available on initial sign in
        // on subsequent requests, only token is available

        async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
            if (user) {
                // If user is defined, it means this is the initial sign-in
                // We can add user information to the token
                await connectToDB();
                const existingUser = await UserModel.findOne({ email: user.email });

                if (!existingUser) {
                    console.error("User not found in database during JWT callback");
                    return token;
                }

                // Add user information to the token
                token._id = existingUser._id.toString();
                token.username = existingUser.username;
                token.avatarUrl = existingUser.avatarUrl;
                token.email = existingUser.email;
            }
            return token;
        },

        async session({ session, token }: { session: Session, token: JWT }): Promise<Session> {
            // Add user information from the token to the session
            if (token) {
                session.user._id = token._id || "";
                session.user.username = token.username || "";
                session.user.avatarUrl = token.avatarUrl || "";
                session.user.email = token.email || "";
            }
            return session;
        },
    },
    secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
