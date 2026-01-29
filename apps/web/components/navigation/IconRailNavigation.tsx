"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MessageSquarePlus } from "lucide-react";

const topItems = [
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/newchat", label: "New DM", icon: MessageSquarePlus },
];

export function IconRailNavigation() {
  const pathname = usePathname();

  return (
    <>
      {topItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`h-10 w-10 rounded-lg flex items-center justify-center ${active ? "bg-accent-primary text-text-inverse" : "bg-accent-soft text-text-primary hover:bg-accent-soft"}`} >
            <Icon size={20} strokeWidth={1.5} />
          </Link>
        );
      })}
    </>
  );
}
