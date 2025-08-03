'use client';

import React, { useEffect, useState } from 'react';
import { UserDTO } from '@crewchat/types/src/UserDTO';
import SearchUsers from './SearchUsers';
import { useRouter } from 'next/navigation';

function FindUser() {
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (selectedUsers.length > 0) {
      router.push(`/user/${selectedUsers[0]._id}`);
    }
  }, [selectedUsers, router]);

  return (
    <section className="w-full min-h-[60vh] max-w-2xl mx-auto px-4 py-6 text-[var(--text-color)]">
      <header className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Find Users</h2>
        <p className="text-sm text-[var(--muted-text)]">
          Search for your friends and start a chat with them.
        </p>
      </header>

      <div className="bg-[var(--muted-bg)] p-4 rounded-lg shadow-sm border border-[var(--border-color)]">
        <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
      </div>
      <div>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-[var(--secondary)] text-[var(--text-color)] rounded-md hover:bg-opacity-80 transition">
          Go Back
        </button>
      </div>
    </section>
  );
}

export default FindUser;
