import express, { Request, Response } from 'express';
import { env } from './config/env';
import { configureCors } from './config/cors';
import { configureSecurity } from './middlewares/security';
import connectDB from './config/database';

const app = express();

// Apply security middleware - helmet & rate limiting
configureSecurity(app);

// Apply CORS configuration
configureCors(app);

// Body parsing middleware - parses JSON requests to req.body (without it, req.body will be undefined)
app.use(express.json());

// Connect to database
connectDB();

// Simple route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Server is running!',
    environment: env.NODE_ENV 
  });
});

    
// Start server
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;