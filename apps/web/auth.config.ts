import type { NextAuthConfig } from "next-auth";

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET environment variable");
}

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  secret: AUTH_SECRET,
  trustHost: true,

  providers: [], // Keep empty for Edge compatibility in Middleware

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.mongoId = user.mongoId;
        token.username = user.username;
        token.avatarUrl = user.avatarUrl;
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
} satisfies NextAuthConfig;
