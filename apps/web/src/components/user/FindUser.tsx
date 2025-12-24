'use client';

import React, { useEffect, useState } from 'react';
import { UserDTO } from '@crewchat/types/src/UserDTO';
import SearchUsers from './SearchUsers';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

function FindUser() {
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (selectedUsers.length > 0) {
      router.push(`/user/${selectedUsers[0]._id}`);
    }
  }, [selectedUsers, router]);

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-[var(--border)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)] flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--primary)]" />
          Find Friends
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">Search for users to start a conversation</p>
      </div>

      <div className="p-6">
        <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FindUser;
