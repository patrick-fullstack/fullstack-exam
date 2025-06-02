import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    // Fix for serverless - disable buffering
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;