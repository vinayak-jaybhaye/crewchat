import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { generateUniqueUsername } from "@/lib/utils/username";
import { connectToDB, UserModel } from "@crewchat/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if(!GOOGLE_CLIENT_ID || ! GOOGLE_CLIENT_SECRET || ! NEXTAUTH_SECRET) {
  throw new Error("Missing environment variables for authentication");
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,

  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectToDB(process.env.MONGODB_URI!);

        const user = await UserModel.findOne({
          email: credentials.email.toString().toLowerCase(),
        });

        if (!user) return null;
        if (!user.passwordAuthenticationEnabled) return null;
        if (!user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash,
        );

        if (!valid) return null;

        await UserModel.updateOne(
          { email: user.email },
          { $set: { lastActive: new Date() } },
        );

        return {
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          mongoId: user._id.toString(),
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      await connectToDB(process.env.MONGODB_URI!);

      let dbUser = await UserModel.findOne({ email });

      if (!dbUser) {
        const base = email.split("@")[0];
        const username = await generateUniqueUsername(base);

        dbUser = await UserModel.create({
          email,
          username,
          avatarUrl: user.image,
          passwordAuthenticationEnabled: false,
          password_hash: null,
          lastActive: new Date(),
        });
      } else {
        await UserModel.updateOne(
          { email },
          { $set: { lastActive: new Date() } },
        );
      }

      // Attach mongoId for jwt()
      (user as any).mongoId = dbUser._id.toString();
      (user as any).username = dbUser.username;
      (user as any).avatarUrl = dbUser.avatarUrl;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.mongoId = (user as any).mongoId;
        token.username = (user as any).username;
        token.avatarUrl = (user as any).avatarUrl;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.mongoId = token.mongoId as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }

      return session;
    },
  },
});
