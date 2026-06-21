import mongoose from "mongoose";

declare global {
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

const getPoolSizeOptions = () => {
  const maxPoolSize = process.env.MONGODB_MAX_POOL_SIZE
    ? parseInt(process.env.MONGODB_MAX_POOL_SIZE, 10)
    : 10;
  const minPoolSize = process.env.MONGODB_MIN_POOL_SIZE
    ? parseInt(process.env.MONGODB_MIN_POOL_SIZE, 10)
    : 2;

  return {
    maxPoolSize,
    minPoolSize,
  };
};

const DEFAULT_POOL_OPTIONS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export async function connectToDB(uri: string, options?: mongoose.ConnectOptions) {
  if (!uri) {
    throw new Error("MongoDB URI is missing");
  }

  if (!global.mongooseConn) {
    const poolOptions = getPoolSizeOptions();
    console.log(`[MongoDB] Creating new connection (maxPoolSize=${poolOptions.maxPoolSize}, minPoolSize=${poolOptions.minPoolSize})`);

    // Register connection lifecycle listeners for monitoring
    mongoose.connection.on("connected", () => {
      console.log("[MongoDB] Connection established successfully");
    });
    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Connection lost");
    });

    global.mongooseConn = mongoose.connect(uri, {
      ...DEFAULT_POOL_OPTIONS,
      ...poolOptions,
      ...options,
    }).catch((err) => {
      global.mongooseConn = undefined;
      throw err;
    });
  }

  try {
    await global.mongooseConn;
  } catch (err) {
    global.mongooseConn = undefined;
    throw err;
  }
  return mongoose;
}

export async function disconnectFromDB() {
  if (global.mongooseConn) {
    await mongoose.disconnect();
    global.mongooseConn = undefined;
  }
}

/**
 * Higher-order function wrapper to ensure the MongoDB connection is active
 * before invoking the wrapped function. Prevents connectToDB boilerplate in callers.
 */
export function withDB<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing");
    }
    await connectToDB(uri);
    return fn(...args);
  };
}
