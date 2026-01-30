import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      // WHEN SOCKET AND NEXT APP ON SAME DOMAIN, USE COOKIES INSTEAD:
      // withCredentials: true,
      autoConnect: false,
      // WHEN SOCKET AND NEXT APP ON DIFFERENT DOMAINS, USE JWT TOKENS INSTEAD:
      auth: {
        token,
      },
    });
  }

  return socket;
}