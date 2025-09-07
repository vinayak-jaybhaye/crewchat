"use client";

import React, { useState } from "react";
import { addMembersToGroupChat } from "@/app/actions/GroupChatActions";
import { SearchUsers } from "@/components/user";
import { UserDTO } from "@crewchat/types";
import { X } from "lucide-react";

function AddMembers({ chatId }: { chatId: string }) {
    const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAddMembers = async () => {
        setLoading(true);
        setError("");

        if (selectedUsers.length === 0) {
            setError("Please select at least one user.");
            setLoading(false);
            return;
        }

        try {
            const userIds = selectedUsers.map((user) => user._id);
            console.log("Adding members:", userIds, "to chat:", chatId);
            await addMembersToGroupChat(chatId, userIds);
            setSelectedUsers([]);
        } catch (err) {
            console.error(err);
            setError("Failed to add members to group.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSelected = (user: UserDTO) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== user._id));
    };

    return (
        <div className="w-full mx-auto mt-8 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] border-b border-[var(--muted)] pb-2">
                    Add Members
                </h2>
            </div>

            {/* Show selected users */}
            <div className="flex gap-2">
                {selectedUsers.map((user) => (
                    <div
                        key={user._id}
                        className="inline-flex flex-row gap-1 items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] shadow-sm"
                    >
                        <p>
                            {user.username}
                        </p>
                        <button
                            title="Remove"
                            onClick={() => handleRemoveSelected(user)}
                            className="text-red-400 cursor-pointer flex items-center justify-center"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="backdrop-blur-md rounded-xl sm:p-6 shadow-sm space-y-4 transition-all">
                <SearchUsers
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                />

                {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleAddMembers}
                        disabled={loading || selectedUsers.length === 0}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        {loading ? "Adding..." : "Add Members"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddMembers;
