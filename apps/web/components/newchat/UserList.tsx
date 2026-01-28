import { Check } from "lucide-react";
import { User } from "@/types";
import ProfilePic from "@/components/user/ProfilePic";

interface UserListProps {
    step: "contacts" | "group-members" | "group-info";
    users: User[];
    loading: boolean;
    searchQuery: string;
    selectedMembers: User[];
    onUserClick: (user: User) => void;
}

export default function UserList({
    step,
    users,
    loading,
    searchQuery,
    selectedMembers,
    onUserClick,
}: UserListProps) {
    if (step === "group-info") return null;

    return (
        <div className="flex-1 overflow-y-auto">
            {loading ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-400">
                    Searching...
                </div>
            ) : users.length > 0 ? (
                <ul className="divide-y divide-neutral-800">
                    {users.map((user) => {
                        const isSelected = selectedMembers.some((m) => m.id === user.id);
                        return (
                            <li
                                key={user.id}
                                onClick={() => onUserClick(user)}
                                className={`px-4 py-3 hover:bg-[#202c33] cursor-pointer flex items-center gap-4 ${isSelected ? "bg-[#202c33]" : ""
                                    }`}
                            >
                                <div className="relative">
                                    {/* Avatar */}
                                    <ProfilePic
                                        size={48}
                                        src={user.avatarUrl}
                                        name={user.username}
                                    />
                                    {/* Selection Checkmark */}
                                    {isSelected && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center border-2 border-[#111b21]">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 border-b border-[#202c33] pb-3 ml-2">
                                    <p className="text-[17px] font-normal text-[#e9edef] truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-sm text-[#8696a0] truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : searchQuery.length >= 2 ? (
                <div className="px-4 py-8 text-center text-sm text-neutral-400">
                    No users found
                </div>
            ) : (
                <div className="px-4 py-8 text-center text-sm text-neutral-400">
                    Search for users to start a new chat
                </div>
            )}
        </div>
    );
}
