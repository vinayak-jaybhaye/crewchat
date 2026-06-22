"use client";

import { MemberList } from "@/components/chat";
import { ChatDetailsDTO, ChatPreviewDTO } from "@/lib/types/chat.types";
import { Bell, Ban, LogOut, Phone, X, Video } from "lucide-react";
import { ProfilePic } from "@/components/user";
import { getChatDetailsByIdAction, leaveGroupAction } from "@/lib/actions/chat.actions";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui";
import { toggleMuteAction } from "@/lib/actions/chat.actions";
import { useChatStore } from "@/store/chat.store";

export default function AboutChat({ chatId, setIsAboutChatOpen, currentUserId }: { chatId: string, setIsAboutChatOpen: (open: boolean) => void, currentUserId: string }) {
  const [chatDetails, setChatDetails] = useState<ChatDetailsDTO | null>(null);
  const [isMuting, setIsMuting] = useState(false);

  // chat from store
  const chat = useChatStore((s) => s.chatsById[chatId]);

  async function fetchChatDetails() {
    const chatDetails = await getChatDetailsByIdAction(chatId);
    setChatDetails(chatDetails);
    // TODO: update chat in store with new details if needed
    // useChatStore.getState().upsertChat(updatedChat);
  }

  useEffect(() => {
    fetchChatDetails();
  }, [chatId]);


  const handleToggleMute = async (checked: boolean) => {
    const currentMuted = chat ? chat.muted : (chatDetails ? chatDetails.muted : false);
    if (chat) {
      useChatStore.getState().setMuted(chatId, !currentMuted);
    }
    setIsMuting(true);
    try {
      await toggleMuteAction(chatId, checked);
      if (chat) {
        useChatStore.getState().setMuted(chatId, checked);
      }
      setChatDetails(prev => prev ? { ...prev, muted: checked } : null);
    } catch (error) {
      // Revert on failure
      if (chat) {
        useChatStore.getState().setMuted(chatId, currentMuted);
      }
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
      <div className="h-full flex flex-col items-center justify-center bg-bg-app text-text-muted gap-3">
        <div className="w-6 h-6 border-2 border-border-strong border-t-accent-primary rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading chat info...</span>
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
    <div className="h-dvh flex flex-col overflow-y-auto bg-bg-app">
      {/* Header Section */}
      <section className="relative flex flex-col items-center justify-center p-8 bg-surface-raised border-b border-border-subtle">
        <button
          className="absolute top-4 right-4 p-2 cursor-pointer rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-all"
          onClick={() => setIsAboutChatOpen(false)}
        >
          <X size={20} />
        </button>

        <div className="mb-4 ring-4 ring-border-subtle rounded-full">
          <ProfilePic src={image} name={name} size={96} />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-0.5 tracking-tight">{name}</h2>
        <p className="text-sm text-text-muted">{subtitle}</p>

        {/* Actions Row */}
        {!isGroup && (
          <div className="flex items-center gap-3 mt-6">
            <button className="flex flex-col items-center justify-center gap-1.5 cursor-pointer p-3 rounded-xl bg-bg-muted hover:bg-bg-subtle text-text-primary hover:text-accent-primary transition-all hover:scale-105 active:scale-95">
              <Phone size={18} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Audio</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1.5 cursor-pointer p-3 rounded-xl bg-bg-muted hover:bg-bg-subtle text-text-primary hover:text-accent-primary transition-all hover:scale-105 active:scale-95">
              <Video size={20} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Video</span>
            </button>
          </div>
        )}
      </section>

      {/* Content Sections */}
      <div className="flex-1 p-4 space-y-3">
        {/* Description / About */}
        {isGroup && (
          <div className="p-4 bg-surface-raised border border-border-subtle rounded-xl">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Group Description</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{chatDetails.description || "No description provided."}</p>
          </div>
        )}

        {/* Settings Actions */}
        <div className="p-4 bg-surface-raised border border-border-subtle rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-text-primary">
            <div className="p-2 rounded-lg bg-bg-muted">
              <Bell size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Mute Notifications</span>
              <span className="text-xs text-text-muted">
                {(chat ? chat.muted : chatDetails.muted) ? "Muted" : "Receiving notifications"}
              </span>
            </div>
          </div>
          <Switch
            checked={chat ? chat.muted : chatDetails.muted}
            onCheckedChange={handleToggleMute}
            disabled={isMuting}
          />
        </div>

        {/* Members Section */}
        {isGroup && (
          <div className="p-4 bg-surface-raised border border-border-subtle rounded-xl">
            <MemberList chatId={chatDetails.id} currentUserRole={chatDetails.role} currentUserId={currentUserId} />
          </div>
        )}

        {/* Danger Zone */}
        <div className="pt-2 pb-6">
          {isGroup ? (
            <button
              onClick={() => handleLeaveGroup()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-red-500 bg-red-500/8 hover:bg-red-500/15 border border-red-500/15 hover:border-red-500/25 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <LogOut size={18} />
              Leave Group
            </button>
          ) : (
            <button
              onClick={() => handleBlockUser()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-red-500 bg-red-500/8 hover:bg-red-500/15 border border-red-500/15 hover:border-red-500/25 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <Ban size={18} />
              Block {name}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
