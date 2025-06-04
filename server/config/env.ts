import dotenv from "dotenv";

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
  SUPER_EMAIL: string;
  SUPER_PASSWORD: string;
  SUPER_FIRSTNAME: string;
  SUPER_LASTNAME: string;
}

// Validate and parse environment variables
const createEnv = (): Environment => {
  const required = [
    "NODE_ENV",
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "CLIENT_URL",
    "SUPER_EMAIL",
    "SUPER_PASSWORD",
    "SUPER_FIRSTNAME",
    "SUPER_LASTNAME",
  ];

  // Validate all required variables exist
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(
        `Environment variable ${key} is required but not set in .env file`
      );
    }
  }

  // Parse and return validated environment
  const NODE_ENV = process.env.NODE_ENV!;
  const PORT = parseInt(process.env.PORT!, 10);
  const MONGO_URI = process.env.MONGO_URI!;
  const JWT_SECRET = process.env.JWT_SECRET!;
  const CLIENT_URL = process.env.CLIENT_URL!;
  const SUPER_EMAIL = process.env.SUPER_EMAIL!;
  const SUPER_PASSWORD = process.env.SUPER_PASSWORD!;
  const SUPER_FIRSTNAME = process.env.SUPER_FIRSTNAME!;
  const SUPER_LASTNAME = process.env.SUPER_LASTNAME!;

  return {
    NODE_ENV,
    PORT,
    MONGO_URI,
    JWT_SECRET,
    CLIENT_URL,
    isDevelopment: () => NODE_ENV === "development",
    isProduction: () => NODE_ENV === "production",
    isTest: () => NODE_ENV === "test",
    SUPER_EMAIL,
    SUPER_PASSWORD,
    SUPER_FIRSTNAME,
    SUPER_LASTNAME,
  };
};

// Create and export the environment configuration
export const env = createEnv();
export default env;
