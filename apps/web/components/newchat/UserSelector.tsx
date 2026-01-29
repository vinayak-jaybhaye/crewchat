'use client';

import { useEffect, useState } from "react";
import { searchUsersAction } from "@/lib/actions/user.actions";
import { UserDTO } from "@/lib/types/user.types";
import { useUserStore } from "@/store/user.store";
import { ProfilePic } from "@/components/user";
import { X, Check } from "lucide-react";

interface UserSelectorProps {
  excludeIds: string[];
  limit: number | null;
  setSelectedIds: (memberIds: string[]) => void;
  selectedIds: string[];
  onAvatarClick: (user: UserDTO) => void;
}

export default function UserSelector({ excludeIds, limit, setSelectedIds, selectedIds, onAvatarClick }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersFromStore, setUsersFromStore] = useState<UserDTO[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        if (usersFromStore.length > 0) setSearchResults(usersFromStore);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsersAction(searchQuery);
        // filter
        const filteredResults = results.filter((u) => !excludeIds.includes(u.id));
        setSearchResults(filteredResults);

        // Update user store - add any new users
        const store = useUserStore.getState();
        store.upsertUsers(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const snapshot = useUserStore.getState().getUsersSnapshot();
    const filteredSnapshot = snapshot.filter((u) => !excludeIds.includes(u.id));
    setUsersFromStore(filteredSnapshot);
    setSearchResults(filteredSnapshot);
  }, [excludeIds]);

  const onToggleMember = (user: UserDTO) => {
    let updatedSelectedUsers: UserDTO[] = [];
    if (selectedUsers.find((u) => u.id === user.id)) {
      updatedSelectedUsers = selectedUsers.filter((u) => u.id !== user.id);
    } else {
      if (limit && selectedUsers.length >= limit) {
        return; // Do not add more than limit
      }
      updatedSelectedUsers = [...selectedUsers, user];
    }
    setSelectedUsers(updatedSelectedUsers);
    setSelectedIds(updatedSelectedUsers.map((u) => u.id));
  }

  return (
    <div className="space-y-3 px-4 pb-4 bg-surface-secondary rounded-lg mt-4">
      {/* Search Input  */}
      <div className="w-full px-2 py-4 rounded-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full h-10 px-4 border-2 border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 transition-all"
        />
      </div>
      {/* Search Results  */}
      <div>
        <div className="relative">
          {/* Selected members chips */}
          {!limit && selectedUsers.length > 0 && <div className="flex gap-2 overflow-x-auto py-2 mb-3 px-1">
            {selectedUsers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 bg-surface-selected border border-border-subtle rounded-full pl-1 pr-2 py-1 shrink-0"
              >
                <ProfilePic src={member.avatarUrl} name={member.username} size={24} onClick={() => onAvatarClick(member)} />

                <span className="text-sm text-text-primary">{member.username}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMember(member);
                  }}
                  className="ml-1 p-0.5 hover:bg-bg-muted rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-text-muted hover:text-accent-primary" />
                </button>
              </div>
            ))}
          </div>}
          <div>
            {loading ? (
              <div className="py-8 text-center text-text-muted">Loading...</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedUsers.find((u) => u.id === user.id)
                      ? "bg-gradient-to-r from-accent-primary/15 to-accent-secondary/15 border border-accent-primary/30"
                      : "hover:bg-surface-selected border border-transparent"
                      }`}
                    onClick={() => {
                      if (!limit) onToggleMember(user);
                      else onAvatarClick(user);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <ProfilePic src={user.avatarUrl} name={user.username} size={36} />
                      <div className="flex flex-col">
                        <span className="text-text-primary">{user.username}</span>
                        <span className="text-text-muted text-sm">{user.email}</span>
                      </div>
                    </div>
                    {selectedUsers.find((u) => u.id === user.id) && (
                      <Check className="w-5 h-5 text-accent-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
