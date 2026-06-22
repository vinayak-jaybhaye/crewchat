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
          <div key={href} className="relative group flex items-center justify-center w-full py-1">
            {/* Left Active Indicator Pill */}
            <div
              className={`absolute left-0 w-1 rounded-r-full bg-accent-primary transition-all duration-300 ${
                active ? "h-6 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-60"
              }`}
            />

            {/* Link Button */}
            <Link
              href={href}
              aria-label={label}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? "bg-accent-primary text-text-inverse shadow-md shadow-accent-primary/20 scale-105"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-muted hover:scale-105"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.75} />
            </Link>

            {/* Hover Tooltip */}
            <div className="absolute left-18 px-2.5 py-1.5 rounded-lg bg-text-primary text-text-inverse text-xs font-semibold shadow-md opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap">
              {label}
            </div>
          </div>
        );
      })}
    </>
  );
}
