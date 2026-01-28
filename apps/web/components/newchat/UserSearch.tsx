import { Users, X } from "lucide-react";
import { User } from "@/types";

interface UserSearchProps {
    step: "contacts" | "group-members" | "group-info";
    searchQuery: string;
    onSearch: (query: string) => void;
    selectedMembers: User[];
    onToggleMember: (user: User) => void;
}

export default function UserSearch({
    step,
    searchQuery,
    onSearch,
    selectedMembers,
    onToggleMember,
}: UserSearchProps) {
    return (
        <div className="px-3 py-2 border-b border-[#202c33] relative">


            <div className="relative">
                {/* Selected members chips */}
                {step === "group-members" && selectedMembers.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2 mb-2 px-1 no-scrollbar">
                        {selectedMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-2 bg-[#202c33] rounded-full pl-1 pr-2 py-1 shrink-0"
                            >
                                {member.avatarUrl ? (
                                    <img
                                        src={member.avatarUrl}
                                        className="w-6 h-6 rounded-full object-cover"
                                        alt={member.username}
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-[#6c7b85] flex items-center justify-center text-[10px] font-medium">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm">{member.username}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleMember(member);
                                    }}
                                    className="ml-1 p-0.5 hover:bg-[#374248] rounded-full"
                                >
                                    <X className="w-3 h-3 text-[#8696a0]" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    placeholder={step === "contacts" ? "Search users..." : "Search name or number"}
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-[#202c33] rounded-lg text-sm text-[#d1d7db] placeholder-[#8696a0] focus:outline-none"
                    autoFocus={step === "group-members" && selectedMembers.length === 0}
                />
            </div>
        </div>
    );
}
