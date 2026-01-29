"use client";

import MemberSelector from "@/components/newchat/UserSelector";
import { useState } from "react";
import { UserPlus } from "lucide-react";

export default function UserSelector({ excludeIds, handleAddMembers }: { excludeIds: string[], handleAddMembers: (memberIds: string[]) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const toggleShowAddMembers = () => {
    setSelectedIds([]);
    setShowAddMembers(!showAddMembers);
  }

  return (
    <div>
      <div className="mb-4 px-4 flex items-center gap-4">
        <button
          className={`px-3 py-2 ${showAddMembers ? "bg-destructive" : "bg-accent-primary"} text-xs rounded-md disabled:opacity-50 cursor-pointer`}
          onClick={toggleShowAddMembers}
        >
          {showAddMembers ? (
            <>Cancel</>
          ) : (<>
            <UserPlus className="inline-block mr-2 b" size={16} />
            Add Members
          </>)}
        </button>
        {showAddMembers && (
          <button
            className="px-3 py-2 bg-accent-primary text-xs rounded-md disabled:opacity-50 cursor-pointer"
            onClick={() => {
              handleAddMembers(selectedIds);
              setSelectedIds([]);
              setShowAddMembers(false);
            }}
            disabled={selectedIds.length === 0}
          >
            Add Selected Members
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