'use client';

import React, { useState } from 'react';
import { CreateGroup } from '@/components/chat';
import FindUser from '@/components/user/FindUser';
import { Users, Search, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [tab, setTab] = useState<'createGroup' | 'findUser'>('createGroup');
  const router = useRouter();

  return (
    <div className="min-h-full w-full bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">New Chat</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 mb-8 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
          <button
            onClick={() => setTab('createGroup')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === 'createGroup'
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-black/5'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50'
              }`}
          >
            <Users className="w-4 h-4" />
            Create Group
          </button>
          <button
            onClick={() => setTab('findUser')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === 'findUser'
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-black/5'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50'
              }`}
          >
            <Search className="w-4 h-4" />
            Find Friends
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tab === 'createGroup' && <CreateGroup />}
          {tab === 'findUser' && <FindUser />}
        </div>
      </div>
    </div>
  );
}
