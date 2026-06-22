import { Check } from "lucide-react";
import { AvatarPicker } from "@/components/ui";

interface GroupInfoProps {
  step: "group-members" | "group-info";
  groupName: string;
  setGroupName: (name: string) => void;
  groupDescription: string;
  setGroupDescription: (description: string) => void;
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
  groupDescription,
  setGroupDescription,
}: GroupInfoProps) {
  if (step !== "group-info") return null;

  return (
    <div className="flex-1 p-8 flex flex-col items-center gap-8 bg-surface-default min-h-0 overflow-y-auto">
      {/* Avatar Picker */}
      <AvatarPicker selected={groupImage} setSelected={setGroupImage} />

      <div className="w-full max-w-md flex flex-col gap-4 text-text-primary">
        {/* Group Name Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Group Name</label>
          <input
            type="text"
            placeholder="Name your group"
            minLength={1}
            maxLength={50}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full h-11 px-4 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-sm"
          />
        </div>

        {/* Group Description Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Description (Optional)</label>
          <textarea
            placeholder="What's this group about?"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            maxLength={200}
            className="w-full p-4 bg-bg-app border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-sm resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Create button */}
      <button
        onClick={onCreateGroup}
        disabled={creatingGroup || groupName.trim().length === 0}
        className="w-12 h-12 bg-accent-primary hover:bg-accent-strong text-text-inverse rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:active:scale-100 mt-4 cursor-pointer"
        title="Create Group"
      >
        {creatingGroup ? (
          <div className="w-5 h-5 rounded-full border-2 border-text-inverse border-t-transparent animate-spin" />
        ) : (
          <Check className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
