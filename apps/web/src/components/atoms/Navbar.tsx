'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { LogOut, Settings, User } from 'lucide-react';

function Navbar() {
    const { data: session, status } = useSession();
    const [showOptions, setShowOptions] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/');
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
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/60">
            <div className="max-w-full mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div
                    onClick={() => {
                        if (session) {
                            router.replace('/chats')
                        } else {
                            router.replace('/')
                        }
                    }}
                    className="cursor-pointer flex items-center gap-2"
                >
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                        CrewChat
                    </span>
                </div>

                <div className="relative">
                    {status === 'loading' ? (
                        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--muted)]" />
                    ) : session ? (
                        <div
                            className="relative"
                            ref={avatarRef}
                        >
                            <button
                                onClick={() => setShowOptions(prev => !prev)}
                                className="flex items-center gap-2 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <Avatar
                                    username={session.user.username || 'User'}
                                    avatarUrl={session.user.avatarUrl}
                                    size={36}
                                />
                            </button>

                            {showOptions && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute right-0 mt-2 w-56 transform rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 text-[var(--card-foreground)] shadow-lg transition-all animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50"
                                >
                                    <div className="px-2 py-2 border-b border-[var(--border)] mb-1">
                                        <p className="text-sm font-medium leading-none">
                                            {session.user.name || 'User'}
                                        </p>
                                        <p className="text-xs leading-none text-[var(--muted-foreground)] mt-1 truncate">
                                            {session.user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            router.push(`/user/${session?.user._id}`);
                                            setShowOptions(false);
                                        }}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[var(--accent)] hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            router.push('/settings');
                                            setShowOptions(false);
                                        }}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[var(--accent)] hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </button>
                                    <div className="h-px bg-[var(--border)] my-1" />
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setShowOptions(false);
                                        }}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[var(--error)] hover:text-white focus:bg-[var(--error)] focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
