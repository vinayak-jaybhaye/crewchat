import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectToDB } from "@crewchat/db";
import seedUsers from "./seedUsers";
// import seedChats from "./seedChats";
// import seedMessages from "./seedMessages";
// TODO: complete seeding scripts for chats and messages

const MONGO_URI = process.env.MONGODB_URI!;
if (!MONGO_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

async function seed() {
  await connectToDB(MONGO_URI);

  await seedUsers();
  // const chats = await seedChats();
  // await seedMessages(chats);

  console.log("Chats, metadata, and messages seeded");
  process.exit(0);
}

seed().catch(console.error);
