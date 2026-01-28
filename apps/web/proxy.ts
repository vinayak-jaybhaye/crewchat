import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Logged out  block everything except /
  if (!session?.user && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged in  block /
  if (session?.user && pathname === "/") {
    return NextResponse.redirect(new URL("/chats", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chats/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/",
  ],
};
