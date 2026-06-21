import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteMessage } from "../deleteMessage";
import { MessageModel, UserChatMetaDataModel } from "@crewchat/db";
import { updateLastMessageIfMatches } from "../updateLastMessage";

vi.mock("@crewchat/db", () => {
  return {
    MessageModel: {
      findById: vi.fn(),
    },
    UserChatMetaDataModel: {
      findOne: vi.fn(),
    },
  };
});

vi.mock("../updateLastMessage", () => {
  return {
    updateLastMessageIfMatches: vi.fn(),
  };
});

describe("deleteMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if message is not found", async () => {
    (MessageModel.findById as any).mockResolvedValue(null);
    await expect(deleteMessage({ messageId: "507f1f77bcf86cd799439011", userId: "507f1f77bcf86cd799439022" })).rejects.toThrow("Message not found");
  });

  it("should throw error if user is not a member of the chat", async () => {
    const mockMessage = {
      _id: { equals: () => false },
      chatId: "chatId1",
      senderId: { equals: () => false },
      deletedAt: null,
    };
    (MessageModel.findById as any).mockResolvedValue(mockMessage);
    (UserChatMetaDataModel.findOne as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(deleteMessage({ messageId: "507f1f77bcf86cd799439011", userId: "507f1f77bcf86cd799439022" })).rejects.toThrow("Forbidden");
  });

  it("should allow owner to delete message", async () => {
    const mockSave = vi.fn();
    const mockMessage = {
      _id: "msgId1",
      chatId: "chatId1",
      senderId: { equals: (id: any) => id.toString() === "507f1f77bcf86cd799439022" },
      deletedAt: null,
      save: mockSave,
    };
    (MessageModel.findById as any).mockResolvedValue(mockMessage);
    (UserChatMetaDataModel.findOne as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ role: "member" }),
    });

    const result = await deleteMessage({ messageId: "507f1f77bcf86cd799439011", userId: "507f1f77bcf86cd799439022" });

    expect(mockSave).toHaveBeenCalled();
    expect(updateLastMessageIfMatches).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("should allow admin to delete message of another user", async () => {
    const mockSave = vi.fn();
    const mockMessage = {
      _id: "msgId1",
      chatId: "chatId1",
      senderId: { equals: (id: any) => false },
      deletedAt: null,
      save: mockSave,
    };
    (MessageModel.findById as any).mockResolvedValue(mockMessage);
    (UserChatMetaDataModel.findOne as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ role: "admin" }),
    });

    const result = await deleteMessage({ messageId: "507f1f77bcf86cd799439011", userId: "507f1f77bcf86cd799439022" });

    expect(mockSave).toHaveBeenCalled();
    expect(updateLastMessageIfMatches).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("should throw error if user is neither owner nor admin", async () => {
    const mockMessage = {
      _id: "msgId1",
      chatId: "chatId1",
      senderId: { equals: (id: any) => false },
      deletedAt: null,
    };
    (MessageModel.findById as any).mockResolvedValue(mockMessage);
    (UserChatMetaDataModel.findOne as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ role: "member" }),
    });

    await expect(deleteMessage({ messageId: "507f1f77bcf86cd799439011", userId: "507f1f77bcf86cd799439022" })).rejects.toThrow("Forbidden");
  });
});
