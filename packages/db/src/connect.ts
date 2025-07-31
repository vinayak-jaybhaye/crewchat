import mongoose, { Mongoose, Connection } from 'mongoose';

export { }

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

// Ensure global.mongoose is initialized
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

export async function connectToDB(MONGODB_URI: string) {
  console.log('<========= DB connection status: =========>', mongoose.connection.readyState);

  // Check if we have a valid cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached DB connection');
    return mongoose;
  }

  // If connection is disconnected, reset cache
  if (mongoose.connection.readyState === 0) {
    console.log('⚠️ Connection disconnected - resetting cache');
    cached.conn = null;
    cached.promise = null;
  }

  // Create new connection if needed
  if (!cached.promise) {
    console.log('🔌 Creating new DB connection');
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'crewchat',
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      heartbeatFrequencyMS: 10000,
    } as mongoose.ConnectOptions).then((conn) => {
      console.log("✅ MongoDB connected");
      return conn;
    }).catch((err) => {
      console.error("❌ MongoDB connection failed:", err);
      cached.promise = null;  // Reset promise on failure
      throw err;
    });
  }

  try {
    await cached.promise;
    cached.conn = mongoose.connection;
    console.log('🚀 DB connected successfully');
    return cached.conn;
  } catch (err) {
    console.error('💥 DB connection failed:', err);
    cached.promise = null;
    throw err;
  }
}