import { Check } from "lucide-react";
import { useState } from 'react';
import AvatarPicker from "@/components/ui/AvatarPicker";

interface GroupInfoProps {
    step: "group-members" | "group-info";
    groupName: string;
    setGroupName: (name: string) => void;
    creatingGroup: boolean;
    onCreateGroup: () => void;
    groupImage: string | null;
    setGroupImage: (image: string | null) => void;
}

export default function GroupInfo({
    step,
    groupName,
    setGroupName,
    creatingGroup,
    onCreateGroup,
    groupImage,
    setGroupImage,
}: GroupInfoProps) {
    if (step !== "group-info") return null;

    return (
        <div className="flex-1 p-8 flex flex-col items-center gap-8">
            {/* Avatar Upload Placeholder */}
            <AvatarPicker selected={groupImage} setSelected={setGroupImage} />

            {/* Group Name Input */}
            <div className="w-full max-w-[400px]">
                <input
                    type="text"
                    placeholder="Group subject (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#00a884] py-2 text-base placeholder-[#8696a0] focus:outline-none"
                />
                {/* Character Count could go here */}
            </div>

            {/* Create Fab */}
            {groupName.trim().length > 0 && (
                <button
                    onClick={onCreateGroup}
                    disabled={creatingGroup}
                    className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#008f6f] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {creatingGroup ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Check className="w-6 h-6 text-white" />
                    )}
                </button>
            )}
        </div>
    );
}
