"use client";

import React, { useState } from "react";
import { createGroupChat, addMembersToGroupChat } from "@/app/actions/GroupChatActions";
import { UserDTO } from "@crewchat/types/src/UserDTO";
import { useRouter } from "next/navigation";
import { SearchUsers } from "../user";
import { Users, FileText, Check, Loader2 } from 'lucide-react';

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
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[var(--border)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Group Details</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Create a space for your team or friends</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Group Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. Weekend Trip Squad"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
            Description <span className="text-[var(--muted-foreground)] font-normal ml-auto text-xs">(optional)</span>
          </label>
          <textarea
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all outline-none resize-none min-h-[100px]"
          />
        </div>

        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedUsers.map((user) => (
              <span
                key={user._id}
                className="inline-flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-medium border border-[var(--primary)]/20"
              >
                {user.username}
              </span>
            ))}
          </div>
        )}

        {/* Search and Add */}
        <div className="pt-2">
          <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;
