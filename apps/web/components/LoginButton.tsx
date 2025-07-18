'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function LoginButton() {
    const { data: session } = useSession();
    console.log('Session:', session);

    return session ? (
        <>
            <p>Hello, {session.user?.username}</p>
            <button onClick={() => signOut()}>Logout</button>
        </>
    ) : (
        <button onClick={() => signIn("google")}>Login with Google</button>
    );
}
