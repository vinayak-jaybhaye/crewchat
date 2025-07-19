"use client";

import React, { useState } from "react";
import { addMembersToGroupChat } from "@/app/actions/GroupChatActions";
import { SearchUsers } from "@/components/user";
import { UserDTO } from "@crewchat/types";

type AddMembersProps = {
    chatId: string;
};

function AddMembers({ chatId }: AddMembersProps) {
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
            alert("Members added successfully!");
            setSelectedUsers([]);
        } catch (err) {
            console.error(err);
            setError("Failed to add members to group.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-4 p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold">Add Members</h2>

            <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                onClick={handleAddMembers}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Adding..." : "Add Members"}
            </button>
        </div>
    );
}

export default AddMembers;
