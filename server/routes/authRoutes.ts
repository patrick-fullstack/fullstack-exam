import express from "express";
import {
  login,
  register,
  getCurrentUser,
  logout,
} from "../controllers/authController";
import { authenticate, authorize } from "../middlewares/auth";
import { authLimiter } from "../middlewares/security";
import { UserRole } from "../models/User";

const router = express.Router();

// Public routes (no authentication required)
// login
router.post("/login", authLimiter, login);

// Protected routes (authentication required)
// Register new user
router.post(
  "/register",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  register
);
// Get current user profile
router.get("/me", authenticate, getCurrentUser);
// logout
router.post("/logout", authenticate, logout);

export default router;
