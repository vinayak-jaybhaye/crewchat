"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NewChatHeader from "@/components/newchat/NewChatHeader";
import UserSearch from "@/components/newchat/UserSearch";
import UserList from "@/components/newchat/UserList";
import GroupInfo from "@/components/newchat/GroupInfo";
import { searchUsersAction } from "@/lib/actions/user.actions";
import { createGroupAction } from "@/lib/actions/chat.actions";
import { useUserStore } from "@/store/user.store";
import { UserDTO } from "@/lib/types/user.types";
import { useSession } from "next-auth/react";

export default function NewGroupPage() {
    const router = useRouter();
    const [step, setStep] = useState<"group-members" | "group-info">("group-members");
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<UserDTO[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupImage, setGroupImage] = useState<string | null>(null);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [usersFromStore, setUsersFromStore] = useState<UserDTO[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length < 2) {
                if (usersFromStore.length > 0) setUsers(usersFromStore);
                return;
            }

            setLoading(true);
            try {
                const results = await searchUsersAction(searchQuery);
                setUsers(results);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        const snapshot = useUserStore.getState().getUsersSnapshot();
        const filteredSnapshot = snapshot.filter((u) => u.id !== session?.user.mongoId);
        setUsersFromStore(filteredSnapshot);
        setUsers(filteredSnapshot);
    }, [session]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };
    const toggleMemberSelection = (user: User) => {
        if (selectedMembers.find((m) => m.id === user.id)) {
            setSelectedMembers(selectedMembers.filter((m) => m.id !== user.id));
        } else {
            setSelectedMembers([...selectedMembers, user]);
        }
    };

    const handleUserClick = (user: User) => {
        toggleMemberSelection(user);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;

        setCreatingGroup(true);
        try {
            const chatId = await createGroupAction(
                groupName,
                selectedMembers.map((m) => m.id),
                groupImage
            );
            router.push(`/chats/${chatId}`);
        } catch (error) {
            console.error("Failed to create group:", error);
        } finally {
            setCreatingGroup(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col relative text-[#e9edef]">
            <NewChatHeader
                title={step === "group-members" ? "Add group participants" : "New group"}
                subtitle={step === "group-members" ? `${selectedMembers.length} selected` : undefined}
                onBack={() => {
                    if (step === "group-info") {
                        setStep("group-members");
                    } else {
                        router.back();
                    }
                }}
            />

            {step === "group-info" ? (
                <GroupInfo
                    step={step}
                    groupName={groupName}
                    setGroupName={setGroupName}
                    creatingGroup={creatingGroup}
                    groupImage={groupImage}
                    setGroupImage={setGroupImage}
                    onCreateGroup={handleCreateGroup}
                />
            ) : (
                <>
                    <UserSearch
                        step={step}
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                        selectedMembers={selectedMembers}
                        onToggleMember={toggleMemberSelection}
                    />

                    <UserList
                        step={step}
                        users={users}
                        loading={loading}
                        searchQuery={searchQuery}
                        selectedMembers={selectedMembers}
                        onUserClick={handleUserClick}
                    />
                </>
            )}

            {/* Floating Action Button for Next Step */}
            {step === "group-members" && selectedMembers.length > 0 && (
                <div className="absolute bottom-6 right-6 z-10">
                    <button
                        onClick={() => setStep("group-info")}
                        className="w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#008f6f] transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-white rotate-180" />
                    </button>
                </div>
            )}
        </div>
    );
}
