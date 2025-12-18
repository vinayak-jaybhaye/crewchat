"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  if (status === "loading") {
    return <p className="grid h-screen place-items-center">Loading...</p>;
  }

  return (
    <main className="grid h-[90vh] place-items-center">
      {!session && (
        <section className="flex w-80 flex-col gap-4 rounded-xl border p-6 text-center">
          <h1 className="text-xl font-semibold">Welcome</h1>

          <p className="text-sm text-muted-foreground">
            Sign in to start chatting with your friends!
          </p>

          <button
            onClick={() => signIn("google")}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 cursor-pointer"
          >
            Continue with Google
          </button>
        </section>
      )}
    </main>
  );
}