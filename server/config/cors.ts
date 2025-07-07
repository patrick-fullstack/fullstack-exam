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
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie",
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

export const configureCors = (app: any) => {
  app.use(cors(corsOptions));
};

export default corsOptions;