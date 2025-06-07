import mongoose from "mongoose";
import { env } from "./env";
import { initializeEmailScheduler } from "../services/emailScheduler";

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

export const initializeDB = async () => {
  await connectDB().catch(error => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
  initializeEmailScheduler();
};

export default connectDB;