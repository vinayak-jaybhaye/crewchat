'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore, ChatStore } from "@/store/chat.store";
import { useUserStore, UserStore } from "@/store/user.store";
import MemberListItem from "./MemberListItem";

import {
    changeMemberRoleAction,
    removeMemberAction,
} from "@/lib/actions/chat.actions";

export default function MemberList({ chatId, currentUserId, currentUserRole }: { chatId: string; currentUserId: string, currentUserRole: string }) {
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
        return <div className="text-sm text-muted">No members</div>;
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

    return (
        <div>
            {members.map((member) => (
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
    );
}
