import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ChatPreviewDTO } from "@/lib/types/chat.types";
import { MessageDTO } from "@/lib/types/message.types";
import { computeChatOrder } from "@/lib/utils/chatStoreHelpers";

interface ChatMessagesBucket {
  ids: string[];
  entities: Record<string, MessageDTO>;
  hasMore: boolean;
  cursor?: string;
  isHydrated: boolean;
}

interface ChatMember {
  userId: string;
  role: "owner" | "admin" | "member";
}

interface PaginateMessagesParams {
  chatId: string;
  messages: MessageDTO[];
  hasMore: boolean;
  cursor?: string;
}

export interface ChatStore {
  chatsById: Record<string, ChatPreviewDTO>;
  chatOrder: string[];
  messagesByChatId: Record<string, ChatMessagesBucket>;
  activeChatId: string | null;
  chatMembersByChatId: Record<string, ChatMember[]>;

  /* actions */
  setChats(chats: ChatPreviewDTO[]): void;
  upsertChat(chat: ChatPreviewDTO): void;
  setActiveChat(chatId: string | null): void;
  markChatAsRead(chatId: string): void;
  setMuted(chatId: string, muted: boolean): void;
  setPinned(chatId: string, pinned: boolean): void;

  paginateMessages(params: PaginateMessagesParams): void;

  addMessage(message: MessageDTO): void;
  updateMessage(chatId: string, message: MessageDTO): void;
  deleteMessage(chatId: string, message: Partial<MessageDTO> & { messageId: string }): void;

  setChatMembers: (chatId: string, members: ChatMember[]) => void;
  addChatMember: (chatId: string, member: ChatMember) => void;
  removeChatMember: (chatId: string, userId: string) => void;
  updateMembership: (chatId: string, userId: string, role: "owner" | "admin" | "member") => void;

  reset(): void;
}

export const useChatStore = create<ChatStore>()(
  immer((set, get) => ({
    chatsById: {},
    chatOrder: [],
    messagesByChatId: {},
    chatMembersByChatId: {},
    activeChatId: null,

    /* ---------- chat list ---------- */
    setChats(chats: ChatPreviewDTO[]) {
      set((state: ChatStore) => {
        const chatsById: ChatStore["chatsById"] = {};
        const chatOrder: string[] = [];

        for (const chat of chats) {
          chatsById[chat.id] = chat;
          chatOrder.push(chat.id);
        }

        return {
          chatsById,
          chatOrder: computeChatOrder(chatOrder, chatsById),
        };
      });
    },


    upsertChat(chat: ChatPreviewDTO) {
      set((state: ChatStore) => {
        const exists = !!state.chatsById[chat.id];

        const chatsById = {
          ...state.chatsById,
          [chat.id]: chat,
        };

        const chatOrder = exists
          ? state.chatOrder
          : [chat.id, ...state.chatOrder];

        return {
          chatsById,
          chatOrder: computeChatOrder(chatOrder, chatsById),
        };
      });
    },

    markChatAsRead(chatId: string) {
      set((state: ChatStore) => {
        const chat = state.chatsById[chatId];
        if (chat) {
          chat.unreadCount = 0;
        }
      });
    },

    setMuted(chatId: string, muted: boolean) {
      set((state: ChatStore) => {
        const chat = state.chatsById[chatId];
        if (chat) {
          chat.muted = muted;
        }
      });
    },

    setPinned(chatId: string, pinned: boolean) {
      set((state: ChatStore) => {
        const chat = state.chatsById[chatId];
        if (!chat) return {};

        const chatsById = {
          ...state.chatsById,
          [chatId]: { ...chat, pinned },
        };

        return {
          chatsById,
          chatOrder: computeChatOrder(state.chatOrder, chatsById),
        };
      });
    },


    /* ---------- active chat ---------- */
    setActiveChat(chatId: string | null) {
      set((state: ChatStore) => {
        state.activeChatId = chatId;
        if (chatId && state.chatsById[chatId]) {
          state.chatsById[chatId].unreadCount = 0;
        }
      });
    },

    /* ---------- pagination (OLDER) ---------- */
    paginateMessages({ chatId, messages, hasMore, cursor }: PaginateMessagesParams) {
      set((state: ChatStore) => {
        if (!state.messagesByChatId[chatId]) {
          state.messagesByChatId[chatId] = {
            ids: [],
            entities: {},
            hasMore: true,
            isHydrated: false,
          };
        }

        const bucket = state.messagesByChatId[chatId];

        const newIds: string[] = [];

        for (const msg of messages) {
          const id = msg.messageId;
          if (!bucket.entities[id]) {
            bucket.entities[id] = msg;
            newIds.push(id);
          }
        }

        // prepend older messages
        if (newIds.length > 0) {
          bucket.ids = [...newIds, ...bucket.ids];
        }

        bucket.hasMore = hasMore;
        bucket.cursor = cursor;
        bucket.isHydrated = true;
      });
    },

    /* ---------- socket append ---------- */
    addMessage(message: MessageDTO) {
      const chatId = message.chatId;
      const id = message.messageId;

      set((state: ChatStore) => {
        const prevBucket = state.messagesByChatId[chatId];

        const bucket = prevBucket
          ? {
            ...prevBucket,
            ids: prevBucket.entities[id]
              ? prevBucket.ids
              : [...prevBucket.ids, id],
            entities: prevBucket.entities[id]
              ? prevBucket.entities
              : { ...prevBucket.entities, [id]: message },
          }
          : {
            ids: [id],
            entities: { [id]: message },
            hasMore: true,
            isHydrated: false,
          };

        const chat = state.chatsById[chatId];
        if (!chat) return {};

        const updatedChat = {
          ...chat,
          lastMessage: {
            id,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            deletedAt: message.deletedAt,
          },
          unreadCount:
            state.activeChatId !== chatId
              ? chat.unreadCount + 1
              : chat.unreadCount,
        };

        const chatsById = {
          ...state.chatsById,
          [chatId]: updatedChat,
        };

        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: bucket,
          },
          chatsById,
          chatOrder: computeChatOrder(state.chatOrder, chatsById),
        };
      });
    },

    updateMessage(chatId, message) {
      set((state: ChatStore) => {
        const bucket = state.messagesByChatId[chatId];
        if (!bucket) return;

        const id = message.messageId;
        if (bucket.entities[id]) {
          bucket.entities[id] = { ...bucket.entities[id], ...message };
        }
      });
    },

    deleteMessage(chatId, message) {
      set((state: ChatStore) => {
        const bucket = state.messagesByChatId[chatId];
        if (!bucket) return;
        message.content = "";

        const id = message.messageId;
        if (bucket.entities[id]) {
          bucket.entities[id] = { ...bucket.entities[id], ...message };
        }
      });
    },

    /* Chat member */
    setChatMembers(chatId: string, members: ChatMember[]) {
      set((state: ChatStore) => {
        state.chatMembersByChatId[chatId] = members;
      });
    },

    addChatMember(chatId: string, member: ChatMember) {
      set((state: ChatStore) => {
        if (!state.chatMembersByChatId[chatId]) {
          state.chatMembersByChatId[chatId] = [];
        }
        state.chatMembersByChatId[chatId].push(member);
      });
    },

    removeChatMember(chatId: string, userId: string) {
      set((state: ChatStore) => {
        if (state.chatMembersByChatId[chatId]) {
          state.chatMembersByChatId[chatId] = state.chatMembersByChatId[chatId].filter((member) => member.userId !== userId);
        }
      });
    },

    updateMembership(chatId: string, userId: string, role: "owner" | "admin" | "member") {
      set((state: ChatStore) => {
        if (state.chatMembersByChatId[chatId]) {
          state.chatMembersByChatId[chatId] = state.chatMembersByChatId[chatId].map((member) => {
            if (member.userId === userId) {
              return { ...member, role };
            }
            return member;
          });
        }
      });
    },

    /* ---------- reset ---------- */
    reset() {
      set({
        chatsById: {},
        chatOrder: [],
        messagesByChatId: {},
        activeChatId: null,
      });
    },
  }))
);
