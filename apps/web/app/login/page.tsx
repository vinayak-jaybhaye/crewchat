"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Only redirect after session is ready (not during render)
    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="text-center mt-4">Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            {!session && (
                <>
                    <p className="text-lg">You are not logged in</p>
                    <button
                        onClick={() => signIn("google")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Sign in with Google
                    </button>
                </>
            )}
        </div>
    );
}
