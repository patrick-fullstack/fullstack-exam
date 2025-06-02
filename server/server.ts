import express, { Request, Response } from "express";
import { env } from "./config/env";
import { configureCors } from "./config/cors";
import { configureSecurity } from "./middlewares/security";
import { configureErrorHandlers } from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/database";

const app = express();

// Trust proxy for Vercel deployment - error in vercel deployment if not set " The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default)."
app.set("trust proxy", 1);

// Apply security middleware - helmet & rate limiting
configureSecurity(app);

// Apply CORS configuration
configureCors(app);

// Body parsing middleware - parses JSON requests to req.body (without it, req.body will be undefined)
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// Connect to the database
connectDB();

// ROUTES
// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Configure error handling middleware
configureErrorHandlers(app);

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

export default app;
