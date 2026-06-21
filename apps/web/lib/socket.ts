import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      autoConnect: false,
      auth: { token },
    });
  } else {
    socket.auth = { token };
  }

  return socket;
}

export function updateSocketToken(token: string): void {
  if (socket) {
    socket.auth = { token };
  }
}

export function destroySocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
