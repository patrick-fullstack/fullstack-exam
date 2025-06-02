import mongoose from "mongoose";
import { env } from "./env";

let isConnected = false;

const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    console.log("Connecting to MongoDB...");
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    isConnected = false;
    throw error;
  }
};

export { isConnected };
export default connectDB;