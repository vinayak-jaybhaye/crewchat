import { Types } from "mongoose";
import { UserModel } from "@crewchat/db";

/**
 * Update password authentication status for a user.
 *
 * @param userId - The user's MongoDB ObjectId
 * @param enabled - Whether password authentication should be enabled
 * @param hashedPassword - The bcrypt-hashed password (must start with "$2" prefix).
 *                         Pass null to clear the password when disabling.
 */
export async function updatePasswordAuthStatus(
  userId: string,
  enabled: boolean,
  hashedPassword: string | null,
): Promise<{ success: boolean }> {
  // Defense-in-depth: verify the password is actually hashed when enabling
  if (enabled) {
    if (!hashedPassword || !hashedPassword.startsWith("$2")) {
      throw new Error("Password must be hashed before storage");
    }
  }

  await UserModel.updateOne(
    { _id: new Types.ObjectId(userId) },
    {
      passwordAuthenticationEnabled: enabled,
      // Set to null (not empty string) when disabling — prevents accidental
      // bcrypt.compare("", "") edge cases
      password_hash: enabled ? hashedPassword : null,
    },
  );

  return { success: true };
}