import express from "express";
import {
  login,
  register,
  getCurrentUser,
  logout,
  refreshToken,
} from "../controllers/authController";
import { authenticate, authorize } from "../middlewares/auth";
import { authLimiter } from "../middlewares/security";
import { UserRole } from "../models/User";
import { upload } from "../middlewares/upload";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", authLimiter, login);

// Protected routes (authentication required)
router.post(
  "/register",
  authenticate,
  authorize(UserRole.SUPER_ADMIN), // Only super admin can register new users
  upload.single("avatar"),
  register
);
router.get("/me", authenticate, getCurrentUser);
router.post("/refresh-token", authenticate, refreshToken);
router.post("/logout", authenticate, logout);

export default router;
