"use client";

import MemberSelector from "@/components/newchat/UserSelector";
import { useState } from "react";
import { UserPlus, X, Check } from "lucide-react";

export default function UserSelector({ excludeIds, handleAddMembers }: { excludeIds: string[], handleAddMembers: (memberIds: string[]) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const toggleShowAddMembers = () => {
    setSelectedIds([]);
    setShowAddMembers(!showAddMembers);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer hover:scale-[0.98] active:scale-95 ${
            showAddMembers
              ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15"
              : "bg-accent-primary text-text-inverse hover:bg-accent-strong shadow-sm"
          }`}
          onClick={toggleShowAddMembers}
        >
          {showAddMembers ? (
            <>
              <X size={14} />
              Cancel
            </>
          ) : (<>
            <UserPlus size={14} />
            Add Members
          </>)}
        </button>
        {showAddMembers && selectedIds.length > 0 && (
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-accent-primary text-text-inverse text-xs font-semibold rounded-lg shadow-sm hover:bg-accent-strong transition-all cursor-pointer hover:scale-[0.98] active:scale-95"
            onClick={() => {
              handleAddMembers(selectedIds);
              setSelectedIds([]);
              setShowAddMembers(false);
            }}
          >
            <Check size={14} />
            Add {selectedIds.length} Member{selectedIds.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
      {showAddMembers && <MemberSelector
          excludeIds={excludeIds}
          limit={null} 
          setSelectedIds={setSelectedIds} 
          selectedIds={selectedIds}
          onAvatarClick={() => {}} 
        />}
    </div>
  );

}