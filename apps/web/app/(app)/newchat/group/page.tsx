"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NewChatHeader, GroupInfo } from "@/components/newchat";
import UserSelector from "@/components/newchat/UserSelector";
import { createGroupAction } from "@/lib/actions/chat.actions";
import { useSession } from "next-auth/react";

export default function NewGroupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"group-members" | "group-info">("group-members");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const { data: session } = useSession();

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;

    setCreatingGroup(true);
    try {
      const chatId = await createGroupAction({
        name: groupName,
        memberIds: selectedIds,
        imageUrl: groupImage,
        description: groupDescription,
      });
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
        subtitle={step === "group-members" ? `${selectedIds.length} selected` : undefined}
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
          groupDescription={groupDescription}
          setGroupDescription={setGroupDescription}
          onCreateGroup={handleCreateGroup}
        />
      ) : (
        <>
          <UserSelector
            selectedIds={selectedIds}
            excludeIds={[session?.user.mongoId || ""]}
            setSelectedIds={setSelectedIds}
            limit={null}
            onAvatarClick={() => { }}
          />
        </>
      )}

      {/* Floating Action Button for Next Step */}
      {step === "group-members" && selectedIds.length > 0 && (
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
