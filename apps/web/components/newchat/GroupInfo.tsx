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
    <div className="flex-1 p-8 flex flex-col items-center gap-8">
      {/* Avatar Upload Placeholder */}
      <AvatarPicker selected={groupImage} setSelected={setGroupImage} />

      <div className="w-full max-w-md flex flex-col gap-4 text-text-primary">
        {/* Group Name Input */}
        <input
          type="text"
          placeholder="Group name"
          minLength={1}
          maxLength={50}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full "
        />

        {/* Group Description Input */}
        <textarea
          placeholder="Add a group description"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          maxLength={200}
          className="w-full"
          rows={3}
        />
      </div>

      {/* Create Fab */}
      <button
        onClick={onCreateGroup}
        disabled={creatingGroup || groupName.trim().length === 0}
        className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {creatingGroup ? (
          <div className="w-6 h-6 rounded-full animate-spin" />
        ) : (
          <Check className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
