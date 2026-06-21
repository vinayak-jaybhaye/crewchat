import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchUsers } from "../searchUsers";
import { UserModel } from "@crewchat/db";

// Mock the db package
vi.mock("@crewchat/db", () => {
  return {
    UserModel: {
      find: vi.fn(),
    },
  };
});

describe("searchUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array for empty search queries", async () => {
    const results = await searchUsers({ query: "   " });
    expect(results).toEqual([]);
    expect(UserModel.find).not.toHaveBeenCalled();
  });

  it("should return empty array for too long queries", async () => {
    const results = await searchUsers({ query: "a".repeat(51) });
    expect(results).toEqual([]);
    expect(UserModel.find).not.toHaveBeenCalled();
  });

  it("should construct RegExp query and map results", async () => {
    const mockUsers = [
      {
        _id: { toString: () => "id1" },
        username: "testuser",
        email: "test@example.com",
        avatarUrl: "http://example.com/avatar.png",
      },
    ];

    const mockFindChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockUsers),
    };

    (UserModel.find as any).mockReturnValue(mockFindChain);

    const results = await searchUsers({ query: "test" });

    expect(UserModel.find).toHaveBeenCalledWith({
      $or: [
        { username: expect.any(RegExp) },
        { email: expect.any(RegExp) },
      ],
    });
    expect(results).toEqual([
      {
        id: "id1",
        username: "testuser",
        email: "test@example.com",
        avatarUrl: "http://example.com/avatar.png",
      },
    ]);
  });

  it("should exclude logged in user email if provided", async () => {
    const mockFindChain = {
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    };

    (UserModel.find as any).mockReturnValue(mockFindChain);

    await searchUsers({ query: "test", excludeEmail: "me@example.com" });

    expect(UserModel.find).toHaveBeenCalledWith({
      $or: [
        { username: expect.any(RegExp) },
        { email: expect.any(RegExp) },
      ],
      email: { $ne: "me@example.com" },
    });
  });
});
