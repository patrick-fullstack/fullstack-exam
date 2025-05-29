import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Configure global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Configure stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Apply security middleware
export const configureSecurity = (app: any) => {
  // Helmet middleware for basic security headers
  app.use(helmet());

  // Apply global rate limiter
  app.use(globalLimiter);

//   // Sanitize data against NoSQL injection
//   app.use(mongoSanitize());

//   // Force HTTPS in production
//   app.use(forceHttps);
};