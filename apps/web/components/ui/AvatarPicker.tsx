"use client";

import Image from "next/image";
import { AVATARS } from "@/lib/avatars";
import { useState } from "react";

export default function AvatarPicker({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: (avatar: string) => void;
}) {
  return (
    <div className="relative">
      <div
        className="
          flex gap-4
          overflow-x-auto
          px-6 py-4
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            type="button"
            onClick={() => {
              if (selected === avatar) {
                setSelected(null);
              } else {
                setSelected(avatar);
              }
            }}
            className={`shrink-0 snap-center rounded-full p-1 border-2 transition-transform duration-200
              ${
                selected === avatar
                  ? "border-blue-500 scale-110"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
          >
            <Image
              src={avatar}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
