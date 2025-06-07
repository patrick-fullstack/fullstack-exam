import express from "express";
import {
  createScheduledEmail,
  getScheduledEmails,
  getEmailById,
  cancelScheduledEmail,
  getEmailTemplates,
  retryEmail,
} from "../controllers/emailController";
import { authenticate, authorize } from "../middlewares/auth";
import { UserRole } from "../models/User";

const router = express.Router();

// All routes need authentication
router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  createScheduledEmail
);
router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getScheduledEmails
);
router.get(
  "/templates",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getEmailTemplates
);
router.get(
  "/:emailId",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getEmailById
);
router.put(
  "/:emailId/cancel",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  cancelScheduledEmail
);
router.put(
  "/:emailId/retry",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  retryEmail
);


export default router;
