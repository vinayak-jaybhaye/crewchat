"use client";

import React, { useState } from "react";
import { createGroupChat } from "@/app/actions/GroupChatActions";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
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
      await createGroupChat(groupName, description);
      alert("Group created successfully!");
      setGroupName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold">Create New Group</h2>

      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
}

export default CreateGroup;
