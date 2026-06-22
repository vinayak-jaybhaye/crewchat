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
    <div className="flex-1 flex flex-col min-h-0 bg-surface-default">
      {/* Search Input */}
      <div className="p-4 border-b border-border-subtle shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full h-11 px-4 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-sm"
        />
      </div>

      {/* Selected members chips */}
      {!limit && selectedUsers.length > 0 && (
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto border-b border-border-subtle bg-bg-app shrink-0 scrollbar-none">
          {selectedUsers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1.5 bg-surface-raised border border-border-subtle rounded-full pl-1 pr-2.5 py-1 shrink-0 shadow-sm animate-in zoom-in-95 duration-150"
            >
              <ProfilePic src={member.avatarUrl} name={member.username} size={22} onClick={() => onAvatarClick(member)} />
              <span className="text-xs font-semibold text-text-primary">{member.username}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMember(member);
                }}
                className="ml-0.5 p-0.5 hover:bg-bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-text-muted">
            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Searching users...</span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <p className="font-medium text-sm">No users found</p>
            <p className="text-xs mt-1">Try searching for another name or email</p>
          </div>
        ) : (
          <div className="space-y-1">
            {searchResults.map((user) => {
              const isSelected = !!selectedUsers.find((u) => u.id === user.id);
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-accent-soft border-accent-primary/20 hover:bg-accent-soft/80"
                      : "hover:bg-surface-selected border-transparent hover:border-border-subtle"
                  }`}
                  onClick={() => {
                    if (!limit) onToggleMember(user);
                    else onAvatarClick(user);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ProfilePic src={user.avatarUrl} name={user.username} size={40} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text-primary truncate">{user.username}</span>
                      <span className="text-xs text-text-muted truncate">{user.email}</span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center shadow-sm animate-in scale-in-95 duration-100">
                      <Check className="w-3.5 h-3.5 text-text-inverse stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
