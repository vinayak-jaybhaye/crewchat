import mongoose from "mongoose";

declare global {
  var mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectToDB(uri: string) {
  if (!uri) {
    throw new Error("MongoDB URI is missing");
  }

  if (!global.mongooseConn) {
    console.log("Creating new MongoDB connection");
    global.mongooseConn = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  await global.mongooseConn;
  return mongoose;
}

export async function disconnectFromDB() {
  if (global.mongooseConn) {
    await mongoose.disconnect();
    global.mongooseConn = undefined;
  }
}
