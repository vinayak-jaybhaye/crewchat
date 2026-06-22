"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/chats" })}
      className="w-full flex items-center justify-center gap-3 rounded-xl bg-surface-default border border-border-subtle px-4 py-3
                 text-sm font-semibold text-text-primary
                 hover:bg-bg-subtle hover:border-border-strong hover:shadow-md hover:-translate-y-0.5
                 active:translate-y-0 active:scale-[0.98]
                 transition-all duration-200 cursor-pointer"
    >
      <Image
        src="/icons/googleIcon.svg"
        alt="Google logo"
        width={20}
        height={20}
        className="shrink-0"
      />
      <span className="text-sm font-semibold">
        Continue with Google
      </span>
    </button>
  );
}
