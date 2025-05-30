import cors from "cors";
import { env } from "./env";

// Parse allowed origins from environment variables
const getAllowedOrigins = (): string[] => {
  // Start with the primary client URL from environment
  const origins = [env.CLIENT_URL];

  // Filter out any undefined/empty values and ensure only strings
  return origins.filter((origin): origin is string => Boolean(origin));
};

// CORS configuration
const corsOptions = {
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
  optionsSuccessStatus: 200,
};

export const configureCors = (app: any) => {
  app.use(cors(corsOptions));
};

export default corsOptions;
