'use client';

import { useState, useEffect } from 'react';
import { UserDTO } from '@crewchat/types';

interface UserSearchBoxProps {
    setSelectedUsers: (users: UserDTO[]) => void;
    selectedUsers: UserDTO[];
}

export default function UserSearchBox({ selectedUsers, setSelectedUsers }: UserSearchBoxProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<UserDTO[]>([]);
    const [selectedIdx, setSelectedIdx] = useState<number>(-1);


    const handleUserClick = (user: UserDTO) => {
        if (selectedUsers.some((u) => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query.length === 0) {
                setSuggestions([]);
                return;
            }

            fetch(`/api/users/search?q=${query}`)
                .then((res) => res.json())
                .then((data) => {
                    setSuggestions(data.users);
                });
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedUser = suggestions[selectedIdx];
            if (selectedUser) handleUserClick(selectedUser);
        }
    };

    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-md">
            <input
                value={query}
                onKeyDown={handleKeyDown}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 rounded-md bg-[var(--input)] text-[var(--input-foreground)] placeholder:text-[var(--muted-foreground)] border border-[var(--border)] focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[var(--ring)] transition-all duration-150"
            />
            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {suggestions.map((user, index) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                        <li
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className={`px-4 py-2 rounded-md cursor-pointer border transition-all duration-150 select-none ${isSelected
                                ? 'bg-[var(--primary)] text-white border-[var(--primary-hover)]'
                                : `bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] ${selectedIdx === index && 'bg-[var(--secondary-hover)]'} border-[var(--border)]`
                                }`}
                        >
                            {user.username}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
