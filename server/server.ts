import express, { Request, Response } from 'express';
import { env } from './config/env';
import { configureCors } from './config/cors';
import { configureSecurity } from './middlewares/security';
import { configureErrorHandlers } from './middlewares/errorHandler';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Apply security middleware - helmet & rate limiting
configureSecurity(app);

// Apply CORS configuration
configureCors(app);

// Body parsing middleware - parses JSON requests to req.body (without it, req.body will be undefined)
app.use(express.json());

// Connect to database
connectDB();

// ROUTES
// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Configure error handling middleware
configureErrorHandlers(app);

// Start server
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;