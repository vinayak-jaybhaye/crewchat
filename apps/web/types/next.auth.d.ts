import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      mongoId: string;
      username: string;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    mongoId?: string;
    username?: string;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    mongoId?: string;
    username?: string;
    avatarUrl?: string | null;
  }
}
