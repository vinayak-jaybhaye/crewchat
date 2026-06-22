"use client";

import React from "react"
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CredentialsLogin() {
  const [email, setEmail] = useState("dev1@example.com");
  const [password, setPassword] = useState("password1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials or password login not enabled");
    } else {
      window.location.href = "/chats";
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2 ml-1 uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
          className="w-full rounded-xl bg-bg-subtle border border-border-subtle px-4 py-3
                     text-sm text-text-primary
                     focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10
                     placeholder:text-text-muted transition-all duration-200
                     disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2 ml-1 uppercase tracking-wider">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          className="w-full rounded-xl bg-bg-subtle border border-border-subtle px-4 py-3
                     text-sm text-text-primary
                     focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10
                     placeholder:text-text-muted transition-all duration-200
                     disabled:opacity-60"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent-primary py-3 mt-4
                   text-sm font-semibold text-text-inverse shadow-lg shadow-accent-primary/20
                   hover:shadow-xl hover:shadow-accent-primary/30 hover:-translate-y-0.5
                   active:translate-y-0 active:scale-[0.98]
                   disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg
                   transition-all duration-200 cursor-pointer
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
