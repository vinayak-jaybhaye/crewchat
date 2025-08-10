"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { SocketProvider } from "@/context/SocketProvider";
import useTheme from "@/hooks/useTheme";

function InnerProviders({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    if (status === "loading" || !session?.user._id) {
        return children;
    }

    return <SocketProvider userId={session?.user._id}>{children}</SocketProvider>;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
    useTheme();
    return (
        <>
            {children}
        </>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <InnerProviders>{children}</InnerProviders>
            </ThemeProvider>
        </SessionProvider>
    );
}
