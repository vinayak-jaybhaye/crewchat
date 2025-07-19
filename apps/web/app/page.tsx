"use client";

import LoginButton from '@/components/LoginButton';
import UserProfile from '@/components/user/UserProfile';
import SearchUsers from '@/components/user/SearchUsers';

import { UserDTO } from '@crewchat/types';
import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);

  useEffect(() => {
    if (selectedUsers.length > 0) {
      router.push(`/user/${selectedUsers[0]._id}`);
    }
  }, [selectedUsers]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to CrewChat</h1>
      <LoginButton />
      <UserProfile />
      <SearchUsers selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
    </main>
  );
}
