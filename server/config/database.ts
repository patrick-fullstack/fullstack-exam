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

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
      bufferCommands: false,
    });

    // Set up event listeners only once
    if (!isConnected) {
      mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully");
        isConnected = true;
      });

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
        isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        isConnected = false;
      });
    }

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error instanceof Error ? error.message : error
    );
    isConnected = false;

    // Don't crash in production - let it retry later
    if (env.NODE_ENV === "production") {
      console.log("Production mode: Continuing without database...");
      return mongoose;
    }

    throw error;
  }
};

export { isConnected };
export default connectDB;
