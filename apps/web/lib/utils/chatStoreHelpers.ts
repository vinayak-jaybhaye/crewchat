import { ChatPreviewDTO } from "../types/chat.types";

export function computeChatOrder(
  chatOrder: string[],
  chatsById: Record<string, ChatPreviewDTO>
) {
  return [...chatOrder].sort((aId, bId) => {
    const a = chatsById[aId];
    const b = chatsById[bId];

    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    // pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // then by last message time using fast lexicographical comparison
    const aTime = a.lastMessage ? a.lastMessage.createdAt : "";
    const bTime = b.lastMessage ? b.lastMessage.createdAt : "";

    if (aTime < bTime) return 1;
    if (aTime > bTime) return -1;
    return 0;
  });
}
