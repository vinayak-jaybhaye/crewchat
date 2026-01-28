import jwt, { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

interface AuthTokenPayload extends JwtPayload {
    sub: string; // userId
}

export function authMiddleware(
    socket: Socket,
    next: (err?: Error) => void
) {
    console.log("Auth middleware");
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Unauthorized"));
    }

    try {
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as AuthTokenPayload;

        if (!payload.sub) {
            return next(new Error("Unauthorized"));
        }

        socket.data.userId = payload.sub;
        next();
    } catch (err) {
        // optional internal logging
        console.error("Socket auth failed:", err);
        next(new Error("Unauthorized"));
    }
}
