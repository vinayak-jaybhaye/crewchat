'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';

function Navbar() {
    const { data: session, status } = useSession();
    const [showOptions, setShowOptions] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLImageElement>(null); // add avatar ref

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        }
    }, [status, router]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Check if click was outside dropdown and avatar
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                avatarRef.current &&
                !avatarRef.current.contains(target)
            ) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            window.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    return (
        <nav className="flex sticky top-0 z-50 items-center justify-between py-4 px-8 bg-[var(--background)] text-[var(--text)] shadow-sm border-b border-[var(--border)]">
            <div
                onClick={() => {
                    if (session) {
                        router.replace('/chats')
                    } else {
                        router.replace('/')
                    }
                }}
                className="cursor-pointer flex items-center text-xl font-semibold tracking-tight"
            >
                CrewChat
            </div>

            <div className="relative">
                {status === 'loading' ? (
                    <span>Loading...</span>
                ) : session ? (
                    <div className="flex items-center space-x-4 cursor-pointer"
                        ref={avatarRef}
                        onClick={() => setShowOptions(prev => !prev)}

                    >
                        <Avatar
                            username={session.user.username || 'User'}
                            avatarUrl={session.user.avatarUrl}
                            size={32}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => signIn()}
                        className="bg-[var(--primary)] hover:brightness-90 text-[var(--button-text)] px-4 py-2 rounded-md text-sm font-semibold transition"
                    >
                        Sign in
                    </button>
                )}

                {showOptions && (
                    <div
                        ref={dropdownRef}
                        className="absolute top-12 right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-2 animate-fadeIn z-50"
                    >
                        <div className="px-3 py-1 text-sm font-medium border-b border-gray-300 dark:border-gray-600">
                            {session?.user?.name || session?.user?.email}
                        </div>
                        <button
                            onClick={() => {
                                router.push(`/user/${session?.user._id}`);
                                setShowOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => {
                                router.push('/settings');
                                setShowOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => {
                                signOut();
                                setShowOptions(false);
                            }}
                            className="w-full text-left px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
