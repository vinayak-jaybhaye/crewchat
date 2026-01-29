"use client";

import { ProfilePic } from "@/components/user";
import { useLongPress } from "@/hooks/userLongPress";
import { useEffect, useRef } from "react";

import type { Member } from "@/components/chat/MemberList";

interface MemberListItemProps {
  member: Member;
  currentUserId: string;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  currentUserRole: "member" | "admin";
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onRemove: (id: string) => void;
  onDM: (id: string) => void;
}

export default function MemberListItem({
  member,
  currentUserRole,
  currentUserId,
  selectedMemberId,
  setSelectedMemberId,
  onPromote,
  onDemote,
  onRemove,
  onDM
}: MemberListItemProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedMemberId) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSelectedMemberId(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMemberId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedMemberId, setSelectedMemberId]);

  const longPressHandlers = useLongPress(() => {
    setSelectedMemberId(member.id);
  });

  return (
    <div
      className="relative flex items-center justify-between p-2 rounded-lg hover:bg-surface-selected/50 transition-colors cursor-pointer group select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setSelectedMemberId(member.id)
      }}
      {...longPressHandlers}
    >
      <div className="flex items-center gap-3 min-w-0">
        <ProfilePic src={member.avatarUrl} size={40} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {member.username}
          </span>
          <span className="text-xs text-text-muted truncate">
            {member.email}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {
          member.isMe && (
            <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent-primary text-[10px] font-bold uppercase tracking-wider">
              You
            </span>
          )
        }
        {
          member.role === "admin" && (
            <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border-subtle text-text-secondary text-[10px] font-bold uppercase tracking-wider">
              Admin
            </span>
          )
        }
      </div>

      {/* Options menu  */}
      {
        !member.isMe && selectedMemberId === member.id && (
          <div
            ref={menuRef}
            className="absolute right-2 top-8 z-50 w-48 bg-surface-raised border border-border-subtle shadow-xl rounded-xl p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            <div
              className="px-3 py-2 hover:bg-surface-selected rounded-lg cursor-pointer text-sm text-text-primary transition-colors"
              onClick={() => onDM(member.id)}
            >
              Message Privately
            </div>

            {currentUserRole === "admin" && member.role === "member" && <div
              className="px-3 py-2 hover:bg-surface-selected rounded-lg cursor-pointer text-sm text-text-primary transition-colors"
              onClick={() => onPromote(member.id)}
            >
              Promote to admin
            </div>}
            {currentUserRole === "admin" && member.role === "admin" && <div
              className="px-3 py-2 hover:bg-surface-selected rounded-lg cursor-pointer text-sm text-text-primary transition-colors"
              onClick={() => onDemote(member.id)}
            >
              Cancel admin
            </div>}
            {currentUserRole === "admin" && member.role === "member" && <div
              className="px-3 py-2 hover:bg-error/10 text-error rounded-lg cursor-pointer text-sm transition-colors"
              onClick={() => onRemove(member.id)}
            >
              Remove
            </div>}
          </div>
        )
      }
    </div>
  )
}