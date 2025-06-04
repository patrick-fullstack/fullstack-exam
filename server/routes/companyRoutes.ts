import express from "express";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  exportCompanyData,
} from "../controllers/companyController";
import { authenticate, authorize } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { UserRole } from "../models/User";
import { globalLimiter } from "../middlewares/security";

const router = express.Router();
// All routes require authentication
router.use(authenticate);

router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getAllCompanies
);
router.get(
  "/export/:companyId",
  globalLimiter,
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  exportCompanyData
);
router.get(
  "/:companyId",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  getCompanyById
);
router.post(
  "/",
  upload.single("logo"),
  globalLimiter,
  authorize(UserRole.SUPER_ADMIN),
  createCompany
);
router.put(
  "/:companyId",
  upload.single("logo"),
  globalLimiter,
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  updateCompany
);
router.delete(
  "/:companyId",
  authorize(UserRole.SUPER_ADMIN),
  globalLimiter,
  deleteCompany
);

export default router;
