import { ChatPreviewDTO } from "../types/chat.types";

export function computeChatOrder(
  chatOrder: string[],
  chatsById: Record<string, ChatPreviewDTO>
) {
  return [...chatOrder].sort((aId, bId) => {
    const a = chatsById[aId];
    const b = chatsById[bId];

    // pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // then by last message time
    const aTime = a.lastMessage
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;

    return bTime - aTime;
  });
}
