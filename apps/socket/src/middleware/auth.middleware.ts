// WHEN SOCKET SERVER IS ON THE SAME DOMAIN AS NEXT APP, USE NEXT-AUTH JWT TOKENS INSTEAD:
import { getToken } from "next-auth/jwt";
import type { Socket } from "socket.io";

export async function authMiddlewareCookie(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    const token = await getToken({
      req: {
        headers: {
          cookie: socket.handshake.headers.cookie ?? "",
        },
      } as any,
      secret: process.env.AUTH_SECRET,
    });

    if (!token?.sub) {
      return next(new Error("Unauthorized"));
    }

    // token contains session from next auth
    // source of truth
    socket.data.userId = token.mongoId;

    next();
  } catch (err) {
    console.error("Socket auth failed:", err);
    next(new Error("Unauthorized"));
  }
}


//  WHEN SOCKET SERVER AND NEXT APP ARE ON DIFFERENT DOMAINS, USE JWT TOKENS INSTEAD:
import jwt from "jsonwebtoken";

export async function authMiddlewareJWT(
  socket: Socket,
  next: (err?: Error) => void
) {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Unauthorized"));

  try {
    const payload = jwt.verify(
      token,
      process.env.SOCKET_JWT_SECRET!
    ) as { sub: string; mongoId: string };

    socket.data.userId = payload.mongoId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}