"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const session = useSession();

  return (
    <main className="flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 py-12">
      <div className="max-w-4xl w-full text-center space-y-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Welcome to{" "}
          <span className="text-[var(--primary)]">
            CrewChat
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--muted-foreground)]">
          Effortless communication with your team, friends, or family. Stay connected, collaborate, and chat in real time.
        </p>

        {session?.data ? (
          <>
            <p className="text-lg font-medium">
              Hello,{" "}
              <span className="text-[var(--primary)]">
                {session.data.user.name || session.data.user.email}
              </span>
              {" "}!
            </p>
            <button
              onClick={() => router.push("/chats")}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition text-white text-lg px-6 py-3 rounded-md shadow"
            >
              View Your Chats
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-medium">
              Please sign in to start chatting.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition text-white text-lg px-6 py-3 rounded-md shadow"
            >
              Sign In
            </button>
          </>
        )}
     </div>
    </main>
  );
}
