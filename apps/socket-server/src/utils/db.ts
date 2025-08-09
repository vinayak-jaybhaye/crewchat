import { connectToDB as connect } from "@crewchat/db";

export const connectToDB = async () => {
    const uri = process.env.MONGO_URL;
    if (!uri) throw new Error("Missing MONGO_URL environment variable");
    return connect(uri);
};
