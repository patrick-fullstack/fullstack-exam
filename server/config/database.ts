import mongoose from 'mongoose';
import { env } from './env';

// Track the connection status
let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose;
  }
  
  // If connection is in progress, wait for it to complete
  if (connectionPromise) {
    console.log('Connection already in progress, waiting...');
    return connectionPromise;
  }
  
  try {
    console.log('Creating new MongoDB connection...');
    
    // Store the connection promise for reuse
    connectionPromise = mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5
    });
    
    // Await the connection
    const conn = await connectionPromise;
    
    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
      connectionPromise = null;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
      connectionPromise = null;
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    isConnected = false;
    connectionPromise = null;
    throw error; // Re-throw to handle in the caller
  }
};

// Export the connection state and function
export { isConnected };
export default connectDB;