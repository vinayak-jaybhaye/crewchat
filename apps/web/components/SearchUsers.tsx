"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function UserSearchBox() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const router = useRouter();

    const handleUserClick = (userId: string) => {
        // Navigate to the user profile page
        router.push(`/user/${userId}`);
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
            console.log(suggestions)
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
                {suggestions.map((user: any) => (
                    <li key={user._id} className="p-2 border-b" onClick={() => handleUserClick(user._id)} >
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}
