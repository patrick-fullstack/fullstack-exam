import express, { Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import companyRoutes from "./routes/companyRoutes";
import emailRoutes from "./routes/emailRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { env } from "./config/env";
import { configureCors } from "./config/cors";
import { configureSecurity } from "./middlewares/security";
import { configureErrorHandlers } from "./middlewares/errorHandler";
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
// Body parsing middleware - parses URL-encoded requests to req.body since the notif endpoint requests are urlencoded
app.use(express.urlencoded({ extended: true }));

// Connect to the database
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// ROUTES
// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/notifications", notificationRoutes);

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
