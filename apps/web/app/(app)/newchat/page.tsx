"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { NewChatHeader } from "@/components/newchat";
import UserSelector from "@/components/newchat/UserSelector";
import { UserPreview } from "@/components/user";
import { UserDTO } from "@/lib/types/user.types";
import { useSession } from "next-auth/react";

export default function NewChatPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  const { data: session } = useSession();

  const handleStartDM = (userId: string) => {
    router.push(`/newchat/${userId}`);
  };

  return (
    <div className="h-full w-full flex flex-col relative text-text-primary">
      <NewChatHeader
        title="New chat"
        onBack={() => router.back()}
      />

      {/* Custom Link to New Group Page */}
      <div className="p-2 bg-surface-default hover:bg-surface-selected rounded-lg transition-all">
        <Link
          href="/newchat/group"
          className="w-full flex items-center hover:scale-98 gap-4 px-3 py-3 rounded-lg transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-text-primary" />
          </div>
          <span className="text-base font-normal">New group</span>
        </Link>
      </div>

      <UserSelector
        onAvatarClick={setSelectedUser}
        excludeIds={[session?.user.mongoId || ""]}
        limit={1}
        selectedIds={[]}
        setSelectedIds={() => { }}
      />

      {/* User Preview Modal */}
      {selectedUser && (
        <div
          className="absolute inset-0 flex items-end justify-center z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <UserPreview
              user={selectedUser}
              onDM={() => handleStartDM(selectedUser.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
