import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the `session.user` object
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

    interface User extends DefaultUser {
        _id?: string;
        username?: string;
        avatarUrl?: string;
    }
}

// Extend the JWT token object
declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        username?: string;
        avatarUrl?: string;
    }
}
