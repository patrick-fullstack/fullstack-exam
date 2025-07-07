import express from "express";
import {
  login,
  register,
  getCurrentUser,
  logout,
  checkSession,
} from "../controllers/authController";
import { authenticate, authorize } from "../middlewares/auth";
import { authLimiter } from "../middlewares/security";
import { UserRole } from "../models/User";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.post("/login", authLimiter, login);
router.get("/session", checkSession);
router.post(
  "/register",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  upload.single("avatar"),
  register
);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
