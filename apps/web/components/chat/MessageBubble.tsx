"use client";

import { useState, useRef, useEffect } from "react";
import { MessageDTO } from "@/lib/types/message.types";
import { formatTime } from "@/lib/utils/time";
import { useUserStore } from "@/store/user.store";
import { ProfilePic } from "@/components/user";
import { MoreVertical, Edit2, Trash2, X, Check, Ban } from "lucide-react";

interface MessageBubbleProps {
  message: MessageDTO;
  isMe: boolean;
  editMessage: (messageId: string, content: string, chatId: string) => void;
  deleteMessage: (messageId: string, chatId: string) => void;
}

export default function MessageBubble({
  message,
  isMe,
  isGroup = false,
  showAvatar = false,
  showName = false,
  editMessage,
  deleteMessage
}: MessageBubbleProps & { isGroup?: boolean; showAvatar?: boolean; showName?: boolean }) {
  const user = useUserStore((s) => s.getUserById(message.senderId));

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus and resize textarea when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.style.height = "auto";
      editInputRef.current.style.height = editInputRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      editMessage(message.messageId, editContent, message.chatId);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={`flex w-full gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <div className={`flex flex-col justify-end shrink-0 w-8 ${showAvatar ? '' : 'invisible'}`}>
          <ProfilePic
            src={user?.avatarUrl}
            name={user?.username || "Unknown"}
            size={32}
          />
        </div>
      )}

      {/* Actions Menu Trigger (Left side for Me) */}
      {isMe && !message.deletedAt && !isEditing && (
        <div className="relative self-center opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-surface-selected cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 p-1 w-32 bg-surface-selected rounded-xl z-20">
              <button
                onClick={() => { setShowMenu(false); setIsEditing(true); }}
                className="w-full text-left px-3 py-2 text-sm  hover:bg-accent-primary flex items-center gap-2 cursor-pointer"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); deleteMessage(message.messageId, message.chatId); }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>

        <div
          className={`px-4 py-2 text-sm shadow-sm relative transition-all
              ${isMe
              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md'
              : 'bg-neutral-800 text-neutral-200 rounded-2xl rounded-tl-md'
            } ${isEditing ? 'w-full min-w-[200px]' : ''}`}
        >
          {message.deletedAt ? (
            <span className="italic text-neutral-400 opacity-70 flex items-center gap-1">
              <Ban size={14} /> Message deleted
            </span>
          ) : isEditing ? (
            <div className="w-full flex flex-col gap-2">
              <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-accent-primary text-text-primary rounded p-1 outline-none resize-none w-full"
                rows={1}
              />
              <div className="flex justify-end gap-2">
                <button onClick={handleCancelEdit} className="p-1 hover:bg-blue-700 rounded text-blue-200 hover:text-white">
                  <X size={14} />
                </button>
                <button onClick={handleSaveEdit} className="p-1 hover:bg-blue-700 rounded text-blue-200 hover:text-white">
                  <Check size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="whitespace-pre-wrap break-words break-all">
                {message.content}
              </p>
            </div>
          )}


          {!isEditing && (
            <div className={`text-[10px] mt-1 flex items-center gap-1 select-none opacity-80 ${isMe ? 'justify-end text-blue-200' : 'justify-end text-neutral-500'}`}>
              {message.editedAt && !message.deletedAt && <span>(edited)</span>}
              <span suppressHydrationWarning>
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {!isMe && showAvatar && user && (
          <span className="text-[11px] text-neutral-400 ml-1 mb-1 block">
            {user.username}
          </span>
        )}

      </div>
    </div>
  );
}