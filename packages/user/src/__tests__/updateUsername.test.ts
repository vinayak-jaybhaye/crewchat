import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUsername } from "../updateUsername";
import { UserModel } from "@crewchat/db";

vi.mock("@crewchat/db", () => {
  return {
    UserModel: {
      findOne: vi.fn(),
      updateOne: vi.fn(),
    },
  };
});

describe("updateUsername", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if username is empty", async () => {
    await expect(updateUsername({ userId: "id1", username: "" })).rejects.toThrow("Username is required");
  });

  it("should throw error if username is too short", async () => {
    await expect(updateUsername({ userId: "id1", username: "ab" })).rejects.toThrow("Username must be at least 3 characters long");
  });

  it("should throw error if username is too long", async () => {
    await expect(updateUsername({ userId: "id1", username: "a".repeat(21) })).rejects.toThrow("Username must be at most 20 characters long");
  });

  it("should throw error if username contains invalid characters", async () => {
    await expect(updateUsername({ userId: "id1", username: "invalid-user" })).rejects.toThrow("Username must contain only letters, numbers, and underscores");
  });

  it("should return success: false if username is already taken", async () => {
    (UserModel.findOne as any).mockResolvedValue({ _id: "taken-id", username: "taken" });

    const result = await updateUsername({ userId: "id1", username: "taken" });

    expect(UserModel.findOne).toHaveBeenCalledWith({ username: "taken" });
    expect(result).toEqual({
      success: false,
      message: "Username already taken.",
    });
    expect(UserModel.updateOne).not.toHaveBeenCalled();
  });

  it("should update username successfully if available", async () => {
    (UserModel.findOne as any).mockResolvedValue(null);
    (UserModel.updateOne as any).mockResolvedValue({ acknowledged: true });

    const result = await updateUsername({ userId: "507f1f77bcf86cd799439011", username: "available" });

    expect(UserModel.findOne).toHaveBeenCalledWith({ username: "available" });
    expect(UserModel.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      { username: "available" }
    );
    expect(result).toEqual({
      success: true,
      message: "Username updated successfully.",
    });
  });
});
