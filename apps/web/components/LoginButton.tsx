'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
    const { data: session } = useSession();
    const router = useRouter();
    console.log('Session:', session);

    return session ? (
        <>
            <p>Hello, {session.user?.username}</p>
            <button onClick={() => signOut()}>Logout</button>
            <button onClick={() => router.push('/chats')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Go To Your Chats
            </button>
        </>
    ) : (
        <button onClick={() => signIn("google")}>Login with Google</button>
    );
}
