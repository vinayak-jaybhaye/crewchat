"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserDTO } from "@crewchat/types";

export default function Home() {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
  const session = useSession();

  useEffect(() => {
    if (selectedUsers.length > 0) {
      router.push(`/user/${selectedUsers[0]._id}`);
    }
  }, [selectedUsers]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 py-12">
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
              !
            </p>
            <button
              onClick={() => router.push("/chats")}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition text-white text-lg px-6 py-3 rounded-md shadow"
            >
              Go to Chats
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

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              title: "Private & Group Chats",
              desc: "Create secure chats with individuals or groups to keep the conversation flowing.",
            },
            {
              title: "Real-time Messaging",
              desc: "Messages sync instantly across devices with real-time updates using Socket.IO.",
            },
            {
              title: "Secure & Fast",
              desc: "Backed by modern tech and WebRTC, enjoy fast, secure, and private interactions.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg shadow hover:shadow-md transition bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]"
            >
              <h3 className="text-xl font-semibold mb-2 text-[var(--primary)]">
                {feature.title}
              </h3>
              <p className="text-[var(--muted-foreground)]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
