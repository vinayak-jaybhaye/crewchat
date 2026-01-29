"use client";

import { MemberList } from "@/components/chat";
import { ChatDetailsDTO } from "@/lib/types/chat.types";
import { Bell, Ban, LogOut, Phone, X, Video } from "lucide-react";
import { ProfilePic } from "@/components/user";
import { getChatDetailsByIdAction, leaveGroupAction } from "@/lib/actions/chat.actions";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui";
import { toggleMuteAction } from "@/lib/actions/chat.actions";

export default function AboutChat({ chatId, setIsAboutChatOpen, currentUserId }: { chatId: string, setIsAboutChatOpen: (open: boolean) => void, currentUserId: string }) {
  const [chatDetails, setChatDetails] = useState<ChatDetailsDTO | null>(null);
  const [muted, setMuted] = useState(chatDetails?.muted ?? false);
  const [isMuting, setIsMuting] = useState(false);

  async function fetchChatDetails() {
    const chatDetails = await getChatDetailsByIdAction(chatId);
    setChatDetails(chatDetails);
  }

  useEffect(() => {
    fetchChatDetails();
  }, [chatId]);

  useEffect(() => {
    if (chatDetails) {
      setMuted(chatDetails.muted);
    }
  }, [chatDetails]);

  const handleToggleMute = async (checked: boolean) => {
    // Optimistic update
    setMuted(checked);
    setIsMuting(true);
    try {
      await toggleMuteAction(chatId, checked);
    } catch (error) {
      // Revert on failure
      setMuted(!checked);
      console.error("Failed to toggle mute", error);
    } finally {
      setIsMuting(false);
    }
  };

  //TODO
  const handleBlockUser = async () => { }
  const handleLeaveGroup = async () => {
    await leaveGroupAction(chatId);
  }

  if (!chatDetails) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-500 gap-3">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-400 rounded-full animate-spin"></div>
        <span className="text-sm">Loading chat info...</span>
      </div>
    );
  }

  const isGroup = chatDetails.isGroup;
  const subtitle = isGroup
    ? `Group · ${chatDetails.createdAt ? new Date(chatDetails.createdAt).getFullYear() : ''}`
    : chatDetails.otherMemberDetails?.email || "User";

  const image = isGroup
    ? chatDetails.imageUrl
    : chatDetails.otherMemberDetails?.avatarUrl;

  const name = isGroup
    ? chatDetails.name
    : chatDetails.otherMemberDetails?.username || chatDetails.name;

  return (
    <div className="h-dvh flex flex-col overflow-y-auto">
      {/* Header Section */}
      <section className="relative flex flex-col items-center justify-center p-6 bg-surface-raised shadow-lg">
        <button
          className="absolute top-4 right-4 p-2 cursor-pointer rounded-full transition-colors hover:scale-110"
          onClick={() => setIsAboutChatOpen(false)}
        >
          <X size={20} className="text-text-primary" />
        </button>

        <div className="mb-4">
          <ProfilePic src={image} name={name} size={96} />
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-1">{name}</h2>
        <p className="text-sm text-text-secondary">{subtitle}</p>

        {/* Actions Row */}
        {!isGroup && (
          <div className="flex items-center gap-8 mt-6">
            <button className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-selected hover:scale-110 transition-all rounded-full p-2">
              <Phone size={18} className="text-text-primary" />
            </button>
            <button className="flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-selected hover:scale-110 transition-all rounded-full p-2">
              <Video size={20} className="text-text-primary" />
            </button>
          </div>
        )}
      </section>

      {/* Content Sections */}
      <div className="flex-1 p-4 space-y-4 bg-surface-default">
        {/* Description / About */}
        {isGroup && <div className="">
          <div className="p-4 text-text-muted">
            <h3 className="text-xs font-medium uppercase tracking-wider mb-2">Group Description</h3>
            <p className="text-sm leading-relaxed">{chatDetails.description || "No description provided."}</p>
          </div>
        </div>}

        {/* Settings Actions */}
        <div className="w-full p-4 flex items-center justify-between text-text-primary">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Mute Notifications</span>
            </div>
          </div>
          <Switch
            checked={muted}
            onCheckedChange={handleToggleMute}
            disabled={isMuting}
          />
        </div>

        {/* Members Section */}
        {isGroup && (
          <MemberList chatId={chatDetails.id} currentUserRole={chatDetails.role} currentUserId={currentUserId} />
        )}

        {/* Danger Zone */}
        <div className="w-full flex items-center justify-center">
          {isGroup ? (
            <button
              onClick={() => handleLeaveGroup()}
              className="flex py-4 px-6 items-center gap-3 text-destructive  hover:scale-105 cursor-pointer transition-all rounded-xl"
            >
              <LogOut size={20} />
              Leave Group
            </button>
          ) : (
            <button
              onClick={() => handleBlockUser()}
              className="flex py-4 px-6 items-center gap-3 text-destructive hover:scale-105 cursor-pointer transition-all rounded-xl"
            >
              <Ban size={20} />
              Block {name}
            </button>
          )}
        </div>

        <div className="h-4"></div>
      </div>
    </div>
  )
}

