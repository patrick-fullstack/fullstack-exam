import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Type-safe environment interface
interface Environment {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  CLIENT_URL: string;
  isDevelopment: () => boolean;
  isProduction: () => boolean;
  isTest: () => boolean;
}

// Validate and parse environment variables
const createEnv = (): Environment => {
  const required = ['NODE_ENV', 'PORT', 'MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
  
  // Validate all required variables exist
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Environment variable ${key} is required but not set in .env file`);
    }
  }

  // Parse and return validated environment
  const NODE_ENV = process.env.NODE_ENV!;
  const PORT = parseInt(process.env.PORT!, 10);
  const MONGO_URI = process.env.MONGO_URI!;
  const JWT_SECRET = process.env.JWT_SECRET!;
  const CLIENT_URL = process.env.CLIENT_URL!;

  return {
    NODE_ENV,
    PORT,
    MONGO_URI,
    JWT_SECRET,
    CLIENT_URL,
    isDevelopment: () => NODE_ENV === 'development',
    isProduction: () => NODE_ENV === 'production',
    isTest: () => NODE_ENV === 'test',
  };
};

// Create and export the environment configuration
export const env = createEnv();
export default env;