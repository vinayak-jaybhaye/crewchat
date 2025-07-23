'use client';

import React, { useEffect } from 'react'
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
        <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => router.replace('/')}>
                <strong>CrewChat</strong>
            </div>
            <div>
                {status === 'loading' ? (
                    <span>Loading...</span>
                ) : session ? (
                    <div className='flex items-center space-x-4'>
                        <Image
                            src={session.user.avatarUrl || '/group-default.png'}
                            alt={session.user.username || 'Chat'}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border bg-gray-300"
                        />
                        <span style={{ marginRight: '1rem' }}>{session.user?.name || session.user?.email}</span>
                        <button onClick={() => signOut()}>Sign out</button>
                    </div>

                ) : (
                    <button onClick={() => signIn()}>Sign in</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar
