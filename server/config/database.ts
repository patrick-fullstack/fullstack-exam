import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Connect with serverless-optimized settings
  const conn = await mongoose.connect(env.MONGO_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;