import express from 'express';
import { login, getCurrentUser, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { authLimiter } from '../middlewares/security';

const router = express.Router();

// Public routes (no authentication required)
// login
router.post('/login', authLimiter, login);

// Protected routes (authentication required)
// Get current user profile
router.get('/me', authenticate, getCurrentUser);

// logout
router.post('/logout', authenticate, logout);

export default router;