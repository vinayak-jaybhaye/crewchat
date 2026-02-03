import bcrypt from "bcryptjs";
import { UserModel } from "@crewchat/db";
import { generateUniqueUsername } from "@/lib/utils/username";
import { AVATARS } from "@/lib/avatars";

// select random avatar
function getRandomAvatar() {
  const index = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[index];
}
const demoUsers = [
  { email: "dev1@example.com", password: "password1" },
  { email: "dev2@example.com", password: "password2" },
  { email: "dev3@example.com", password: "password3" },
  { email: "dev4@example.com", password: "password4" },
  { email: "dev5@example.com", password: "password5" },
];

export default async function seedUsers() {
  for (const user of demoUsers) {
    const email = user.email.toLowerCase();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log(`User ${email} already exists, aborting seeding`);
      process.exit(1);
    }

    const base = email.split("@")[0];
    const password_hash = await bcrypt.hash(user.password, 12);

    await UserModel.create({
      email,
      username: await generateUniqueUsername(base),
      password_hash,
      avatarUrl: getRandomAvatar(),
      passwordAuthenticationEnabled: true,
      lastActive: new Date(),
      isDemo: true,
    });
  }

  console.log("Demo users ready");
  process.exit(0);
}