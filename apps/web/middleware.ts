import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Logged out -> block everything except /
  if (!session?.user && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged in -> block / (redirect to chats)
  if (session?.user && pathname === "/") {
    return NextResponse.redirect(new URL("/chats", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/chats/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/",
  ],
};
