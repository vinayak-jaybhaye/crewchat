import jwt from "jsonwebtoken";
import { auth } from "@/auth";
import { rateLimitSocketToken } from "@/lib/rateLimit";
export const runtime = "nodejs";

const EXPIRY_SECONDS = 15 * 60;

export async function GET() {
  if (!process.env.SOCKET_JWT_SECRET) {
    throw new Error("Missing SOCKET_JWT_SECRET");
  }

  const session = await auth();

  if (!session?.user?.mongoId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 requests per minute per user
  try {
    await rateLimitSocketToken(session.user.mongoId);
  } catch {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const socketToken = jwt.sign(
    { mongoId: session.user.mongoId },
    process.env.SOCKET_JWT_SECRET,
    { expiresIn: EXPIRY_SECONDS },
  );

  return Response.json({ token: socketToken, expiresIn: EXPIRY_SECONDS });
}
