"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chat.store";


type SocketContextType = {
    isConnected: boolean;
};

interface Message {
    id: string;
    content: string;
    senderId: string;
    chatId: string;
    createdAt: Date;
    updatedAt: Date;
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;

        const socket = getSocket();

        socket.auth = { userId: session.user.mongoId };
        socket.connect();

        // define event listeners
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onMessageNew = (message: Message) => {
            useChatStore.getState().addMessage(message);
        };
        const onMessageEdit = ({ chatId, messageId, content }: { chatId: string; messageId: string; content: string }) => {
            useChatStore.getState().updateMessage(chatId, { messageId, content, editedAt: new Date().toISOString() } as any);
        };
        const onMessageDelete = ({ chatId, messageId }: { chatId: string; messageId: string }) => {
            useChatStore.getState().deleteMessage(chatId, { messageId, deletedAt: new Date().toISOString() } as any);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message:new", onMessageNew);
        socket.on("message:edit", onMessageEdit);
        socket.on("message:delete", onMessageDelete);


        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message:new", onMessageNew);
            socket.off("message:edit", onMessageEdit);
            socket.off("message:delete", onMessageDelete);
        };
    }, [status, session?.user?.mongoId]);

    useEffect(() => {
        return () => {
            const socket = getSocket();
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
