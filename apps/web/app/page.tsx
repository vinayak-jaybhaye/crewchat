"use client";

import LoginButton from '@/components/LoginButton';
import UserProfile from '@/components/UserProfile';

export default function Home() {

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      if
      <h1 className="text-3xl font-bold mb-6">Welcome to CrewChat</h1>
      <LoginButton />
      <UserProfile />
    </main>
  );
}
