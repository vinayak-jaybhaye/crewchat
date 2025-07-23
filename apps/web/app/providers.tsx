"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { SocketProvider } from "@/context/SocketProvider";

function InnerProviders({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    if (status === "loading" || !session?.user._id) {
        return children;
    }

    return <SocketProvider userId={session?.user._id}>{children}</SocketProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <InnerProviders>{children}</InnerProviders>
        </SessionProvider>
    );
}
