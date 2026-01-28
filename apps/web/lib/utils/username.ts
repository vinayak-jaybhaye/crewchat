import crypto from "crypto";
import { UserModel } from "@crewchat/db";

export async function generateUniqueUsername(base: string) {
  const cleanBase = base.toLowerCase().replace(/[^a-z0-9_]/g, "");

  while (true) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const username = `${cleanBase}_${suffix}`;

    const exists = await UserModel.exists({ username });
    if (!exists) return username;
  }
}
