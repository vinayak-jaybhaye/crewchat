'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserDTO } from '@crewchat/types';

interface UserSearchBoxProps {
    setSelectedUsers: (users: UserDTO[]) => void;
    selectedUsers: UserDTO[];
}

export default function UserSearchBox({ selectedUsers, setSelectedUsers }: UserSearchBoxProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<UserDTO[]>([]);
    const router = useRouter();

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

    return (
        <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--muted-bg)] shadow-sm">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full p-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-color)] placeholder-[var(--muted-text)] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <ul className="mt-4 space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {suggestions.map((user) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                        <li
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className={`p-3 rounded cursor-pointer transition-colors duration-200 border border-transparent ${isSelected
                                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-blue-400'
                                    : 'hover:bg-[var(--hover-bg)] text-[var(--text-color)]'
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
