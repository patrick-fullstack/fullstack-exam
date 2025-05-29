import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

// Define a type for Express errors
export interface ExpressError extends Error {
  status?: number;
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, ) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
};

// Global error handler
export const globalErrorHandler = (
  err: ExpressError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Server error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

// Configure error handlers
export const configureErrorHandlers = (app: any) => {
  // Error handling for 404 routes - must be after all routes
  app.use(notFoundHandler);

  // Global error handling
  app.use(globalErrorHandler);
};
