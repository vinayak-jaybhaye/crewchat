"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserDTO } from "@crewchat/types";


interface UserSearchBoxProps {
    setSelectedUsers: (users: UserDTO[]) => void;
    selectedUsers: UserDTO[];
}

export default function UserSearchBox({ selectedUsers, setSelectedUsers }: UserSearchBoxProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<UserDTO[]>([]);
    const router = useRouter();

    const handleUserClick = (user: UserDTO) => {
        if (selectedUsers.some(u => u._id === user._id)) {
            // If user is already selected, remove them
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            // Otherwise, add them to the selection
            setSelectedUsers([...selectedUsers, user]);
        }
    }

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
        }, 300); // debounce

        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="p-4">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="border p-2 rounded w-full"
            />
            <ul className="mt-2">
                {suggestions.map((user) => (
                    <li
                        key={user._id}
                        className={`p-2 cursor-pointer ${selectedUsers.some(u => u._id === user._id) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        onClick={() => handleUserClick(user)}
                    >
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}
