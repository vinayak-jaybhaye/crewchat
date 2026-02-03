"use client";

import React from "react"
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CredentialsLogin() {
  const [email, setEmail] = useState("dev1@example.com");
  const [password, setPassword] = useState("password1");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials or password login not enabled");
    } else {
      window.location.href = "/chats";
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-primary mb-2 ml-1 uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-lg bg-bg-subtle px-4 py-2.5
                     text-sm text-text-primary
                     focus:ring-2 focus:ring-accent-primary/30
                     placeholder:text-text-muted transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-primary mb-2 ml-1 uppercase tracking-wider">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full rounded-lg bg-bg-subtle px-4 py-2.5
                     text-sm text-text-primary
                     focus:ring-2 focus:ring-accent-primary/30
                     placeholder:text-text-muted transition-all duration-200"
        />
      </div>

      {error && <p className="text-xs text-error font-medium mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-accent-primary py-2.5 mt-6
                   text-sm font-semibold text-text-inverse shadow-lg
                   hover:shadow-xl hover:-translate-y-1
                   active:translate-y-0 active:scale-[0.98]
                   transition-all duration-200 cursor-pointer"
      >
        Login
      </button>
    </form>
  );
}
