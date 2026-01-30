import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const EXPIRY_SECONDS = 15 * 60; // 15 minutes

export async function GET(req: Request) {
  if (!process.env.SOCKET_JWT_SECRET) {
    throw new Error("Missing SOCKET_JWT_SECRET");
  }

  const session = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(session);

  // short-lived socket token
  const socketToken = jwt.sign(
    { mongoId: session.mongoId },
    process.env.SOCKET_JWT_SECRET!,
    { expiresIn: EXPIRY_SECONDS }
  );

  return NextResponse.json({ token: socketToken });
}