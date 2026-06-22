"use client";
import React, { useState, useRef, useEffect } from "react";
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
            <div className="absolute right-0 top-full mt-1 p-1 w-36 bg-surface-raised border border-border-subtle rounded-xl shadow-lg z-20">
              <button
                onClick={() => { setShowMenu(false); setIsEditing(true); }}
                className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-selected rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); deleteMessage(message.messageId, message.chatId); }}
                className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>

        <div
          className={`px-4 py-2.5 text-sm shadow-sm relative transition-all duration-200
            ${isMe
              ? 'bg-accent-primary text-text-inverse ' + (showAvatar ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-r-sm')
              : 'bg-bg-muted text-text-primary ' + (showAvatar ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl rounded-l-sm')
            } ${isEditing ? 'w-full min-w-[240px] bg-surface-default border border-border-subtle !text-text-primary' : ''}`}
        >
          {message.deletedAt ? (
            <span className="italic text-text-muted opacity-70 flex items-center gap-1.5">
              <Ban size={14} /> Message deleted
            </span>
          ) : isEditing ? (
            <div className="w-full flex flex-col gap-2">
              <textarea
                ref={editInputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-bg-subtle text-text-primary border border-border-subtle rounded-lg p-2 outline-none resize-none w-full text-sm focus:ring-2 focus:ring-accent-primary/20"
                rows={1}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 hover:bg-bg-muted rounded-lg text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="p-1.5 bg-accent-primary rounded-lg text-text-inverse hover:bg-accent-strong transition-all cursor-pointer shadow-sm"
                  title="Save"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="whitespace-pre-wrap break-words break-all leading-relaxed select-text">
                {renderMarkdown(message.content)}
              </div>
            </div>
          )}

          {!isEditing && (
            <div className={`text-[9px] font-medium mt-1 flex items-center gap-1 select-none opacity-60 justify-end ${
              isMe ? 'text-text-inverse/85' : 'text-text-muted'
            }`}>
              {message.editedAt && !message.deletedAt && <span>(edited)</span>}
              <span suppressHydrationWarning>
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}
        </div>

        {!isMe && showAvatar && user && (
          <span className="text-[11px] font-medium text-text-muted ml-2 mt-1 mb-0.5 block select-none">
            {user.username}
          </span>
        )}

      </div>
    </div>
  );
}

/**
 * Lightweight, safe client-side Markdown rendering helper.
 * Matches standard inline tokens (**bold**, *italic*, `code`, URLs).
 */
function renderMarkdown(content: string): React.ReactNode {
  if (!content) return "";

  const lines = content.split("\n");

  return lines.map((line, lineIdx) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|https?:\/\/\S+)/g;
    const tokens = line.split(regex);

    const elements = tokens.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={partIdx} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={partIdx} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={partIdx} className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs text-accent-primary">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <a
            key={partIdx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-strong transition-colors break-all text-inherit opacity-90 font-medium"
          >
            {part}
          </a>
        );
      }
      return part;
    });

    return (
      <span key={lineIdx} className="block min-h-[1.25rem]">
        {elements}
      </span>
    );
  });
}