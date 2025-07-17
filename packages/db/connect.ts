import mongoose, { Mongoose } from 'mongoose';

declare global {
    var mongoose: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    } | undefined;
}

// Ensure global.mongoose is initialized
if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

export async function connectToDB(MONGODB_URI: string) {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            dbName: 'crewchat',
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
