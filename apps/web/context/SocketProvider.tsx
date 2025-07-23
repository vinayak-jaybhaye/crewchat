"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

if (!SOCKET_URL) {
    throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined in the environment variables.");
}

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            newSocket.emit("register-user", userId);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useGlobalSocket() {
    return useContext(SocketContext);
}
