'use client';

import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();

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
                        <img src={session.user.avatarUrl || session.user.image || '/default-avatar.png'} alt="Avatar" className="w-10 h-10 rounded-full" />
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
