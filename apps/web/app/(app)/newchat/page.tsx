"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import NewChatHeader from "@/components/newchat/NewChatHeader";
import UserSearch from "@/components/newchat/UserSearch";
import UserList from "@/components/newchat/UserList";
import UserPreview from "@/components/user/UserPreview";
import { searchUsersAction } from "@/lib/actions/user.actions";
import { UserDTO } from "@/lib/types/user.types";
import { useUserStore } from "@/store/user.store";
import { useSession } from "next-auth/react";

export default function NewChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [usersFromStore, setUsersFromStore] = useState<UserDTO[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        if (usersFromStore.length > 0) setUsers(usersFromStore);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsersAction(searchQuery);
        setUsers(results);
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
    const filteredSnapshot = snapshot.filter((u) => u.id !== session?.user.mongoId);
    setUsersFromStore(filteredSnapshot);
    setUsers(filteredSnapshot);
  }, [session]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStartDM = (userId: string) => {
    router.push(`/newchat/${userId}`);
  };

  return (
    <div className="h-full w-full flex flex-col relative text-[#e9edef]">
      <NewChatHeader
        title="New chat"
        onBack={() => router.back()}
      />

      {/* Custom Link to New Group Page */}
      <div className="px-3 py-2 border-b border-[#202c33]">
        <Link
          href="/newchat/group"
          className="w-full flex items-center gap-4 px-3 py-3 hover:bg-[#202c33] rounded-lg transition-colors group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-normal text-[#e9edef]">New group</span>
        </Link>
      </div>

      <UserSearch
        step="contacts"
        searchQuery={searchQuery}
        onSearch={handleSearch}
        selectedMembers={[]}
        onToggleMember={() => { }}
      />

      <UserList
        step="contacts"
        users={users}
        loading={loading}
        searchQuery={searchQuery}
        selectedMembers={[]}
        onUserClick={setSelectedUser}
      />

      {/* User Preview Modal */}
      {selectedUser && (
        <div
          className="absolute inset-0 bg-black/60 flex items-end justify-center z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPreview
              user={selectedUser}
              onDM={() => handleStartDM(selectedUser.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
