import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { UserRole } from "../models/User";
import {
  authenticatePusher,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController";
const router = Router();

router.use(authenticate);

router.post(
  "/pusher/auth",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  authenticatePusher
);
router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  getNotifications
);
router.patch(
  "/:id/read",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  markNotificationAsRead
);
router.patch(
  "/mark-all-read",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  markAllNotificationsAsRead
);

export default router;
