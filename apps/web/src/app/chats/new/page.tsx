'use client';

import React, { useState } from 'react';
import { CreateGroup } from '@/components/chat';
import FindUser from '@/components/user/FindUser';

export default function Page() {
  const [tab, setTab] = useState<'createGroup' | 'findUser'>('createGroup');

  return (
    <section className="w-full bg-[var(--background)] text-[var(--text-color)] px-4 py-6 overflow-auto scrollbar-hide">
      <header className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTab('createGroup')}
            className={`px-4 py-2 rounded-md font-medium transition shadow-sm border 
              ${tab === 'createGroup'
                ? 'bg-[var(--primary)] text-[var(--button-text)] border-transparent'
                : 'bg-[var(--muted-bg)] text-[var(--muted-text)] border-[var(--border-color)]'
              }`}
          >
            Create Group
          </button>
          <button
            onClick={() => setTab('findUser')}
            className={`px-4 py-2 rounded-md font-medium transition shadow-sm border 
              ${tab === 'findUser'
                ? 'bg-[var(--primary)] text-[var(--button-text)] border-transparent'
                : 'bg-[var(--muted-bg)] text-[var(--muted-text)] border-[var(--border-color)]'
              }`}
          >
            Find Friends
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto mt-4">
        {tab === 'createGroup' && <CreateGroup />}
        {tab === 'findUser' && <FindUser />}
      </main>
    </section>
  );
}
