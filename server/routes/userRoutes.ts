import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";
import { UserRole } from "../models/User";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER), getAllUsers);
router.get(
  "/:userId",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  getUserById
);
router.put(
  "/:userId",
  upload.single("avatar"),
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  updateUser
);
router.delete("/:userId", authorize(UserRole.SUPER_ADMIN), deleteUser);

export default router;
