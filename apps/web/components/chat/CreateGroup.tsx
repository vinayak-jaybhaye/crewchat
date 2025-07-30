"use client";

import React, { useState } from "react";
import { createGroupChat, addMembersToGroupChat } from "@/app/actions/GroupChatActions";
import { UserDTO } from "@crewchat/types/UserDTO";
import { useRouter } from "next/navigation";
import { SearchUsers } from "../user";

function CreateGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    if (!groupName.trim()) {
      setError("Group name is required.");
      setLoading(false);
      return;
    }

    try {
      const createdChat = await createGroupChat(groupName, description);
      if (createdChat && selectedUsers.length > 0 && createdChat._id) {
        await handleAddMembers(createdChat._id);
      }
      setGroupName("");
      setDescription("");
      router.push("/chats");
    } catch (err) {
      console.error(err);
      setError("Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async (chatId: string) => {
    try {
      const userIds = selectedUsers.map((user) => user._id);
      await addMembersToGroupChat(chatId, userIds);
    } catch (err) {
      console.error(err);
      setError("Failed to add members to group.");
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2">Create a New Group</h1>
          <p className="text-[var(--secondary)] text-base max-w-md mx-auto">
            Organize your team, friends, or family into a dedicated chat group.
          </p>
        </header>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Study Buddies"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full text-base px-4 py-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              placeholder="Write something about this group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-base px-4 py-3 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition resize-none"
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          {/* Selected Members */}
          <div>
            {selectedUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] px-3 py-1 rounded-full text-sm"
                  >
                    {user.username}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--secondary)]">No members selected.</p>
            )}
          </div>

          {/* Search and Add */}
          <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="bg-[var(--secondary)] bg-opacity-10 hover:bg-opacity-20 text-[var(--text-color)] font-medium px-6 py-3 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-[var(--primary)] hover:bg-opacity-90 text-[var(--text-color)] font-medium px-6 py-3 rounded-md transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;
