'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore, ChatStore } from "@/store/chat.store";
import { useUserStore, UserStore } from "@/store/user.store";
import { MemberListItem, AddMembers } from "@/components/chat";
import { addMembersAction } from "@/lib/actions/chat.actions";

import {
  changeMemberRoleAction,
  removeMemberAction,
} from "@/lib/actions/chat.actions";

export interface Member {
  id: string;
  username: string;
  avatarUrl: string | null;
  email: string;
  lastActive?: string;
  role: "member" | "admin";
  isMe: boolean;
}

export default function MemberList({ chatId, currentUserId, currentUserRole }: { chatId: string; currentUserId: string, currentUserRole: "member" | "admin" }) {
  const router = useRouter();
  const membersData = useChatStore((s: ChatStore) => s.chatMembersByChatId[chatId]);
  const usersById = useUserStore((s: UserStore) => s.usersById);
  const updateMembership = useChatStore((s: ChatStore) => s.updateMembership);
  const removeChatMember = useChatStore((s: ChatStore) => s.removeChatMember);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const members = (membersData ?? [])
    .map((m) => {
      const user = usersById[m.userId];
      if (!user) return null;

      return {
        ...user,
        role: m.role,
        isMe: m.userId === currentUserId
      };
    }).filter(Boolean);


  if (members.length === 0) {
    return <div className="text-sm text-text-muted py-4 text-center">No members found</div>;
  }

  const handlePromote = async (memberId: string) => {
    try {
      await changeMemberRoleAction(chatId, memberId, "admin");
      updateMembership(chatId, memberId, "admin");
    } catch (error) {
      console.error("Failed to promote", error);
    }
  };

  const handleDemote = async (memberId: string) => {
    try {
      await changeMemberRoleAction(chatId, memberId, "member");
      updateMembership(chatId, memberId, "member");
    } catch (error) {
      console.error("Failed to demote", error);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await removeMemberAction(chatId, memberId);
      removeChatMember(chatId, memberId);
    } catch (error) {
      console.error("Failed to remove", error);
    }
  };

  const handleAddMembers = async (membersToAdd: string[]) => {
    try {
      await addMembersAction(chatId, membersToAdd);
    } catch (error) {
      console.error("Failed to add members", error);
    }
  }

  return (
    <div className="space-y-3">
      <AddMembers
        excludeIds={members.flatMap(m => (m?.id ? [m.id] : []))}
        handleAddMembers={handleAddMembers}
      />
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
          Members
          <span className="px-1.5 py-0.5 rounded-md bg-bg-muted text-[10px] font-bold text-text-secondary">
            {members.length}
          </span>
        </h4>
        {members
          .filter((member): member is Member => Boolean(member))
          .map((member) => (
            <MemberListItem
              key={member.id}
              member={member}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              selectedMemberId={selectedMemberId}
              setSelectedMemberId={setSelectedMemberId}
              onPromote={handlePromote}
              onDemote={handleDemote}
              onRemove={handleRemove}
              onDM={() => router.push(`/newchat/${member.id}`)}
            />
          ))}
      </div>
    </div >
  );
}
