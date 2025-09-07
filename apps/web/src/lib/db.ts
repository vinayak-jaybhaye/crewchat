import { connectToDB as connect } from "@crewchat/db";

export const connectToDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI");
    return connect(uri);
};
