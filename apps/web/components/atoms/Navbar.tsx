'use client';

import React, { useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        }
    }, [status]);

    return (
        <nav className="flex sticky top-0 z-50 items-center justify-between py-4 px-8 bg-[var(--navbar-bg)] text-[var(--navbar-text)] shadow-sm border-b border-[var(--border-color)]">
            <div
                onClick={() => router.replace('/')}
                className="cursor-pointer flex items-center text-xl font-semibold tracking-tight"
            >
                CrewChat
            </div>
            <div>
                {status === 'loading' ? (
                    <span>Loading...</span>
                ) : session ? (
                    <div className="flex items-center space-x-4">
                        <Image
                            src={session.user.avatarUrl || '/group-default.png'}
                            alt={session.user.username || 'Chat'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border bg-gray-300"
                        />
                        <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                        <button
                            onClick={() => signOut()}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold transition"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="bg-[var(--primary)] hover:brightness-90 text-[var(--button-text)] px-4 py-2 rounded-md text-sm font-semibold transition"
                    >
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
