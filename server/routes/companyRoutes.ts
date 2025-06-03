import express from "express";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController";
import { authenticate, authorize } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { UserRole } from "../models/User";

const router = express.Router();
// All routes require authentication
router.use(authenticate);

router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getAllCompanies
);
router.get(
  "/:companyId",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  getCompanyById
);
router.post(
  "/",
  upload.single("logo"),
  authorize(UserRole.SUPER_ADMIN),
  createCompany
);
router.put(
  "/:companyId",
  upload.single("logo"),
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  updateCompany
);
router.delete("/:companyId", authorize(UserRole.SUPER_ADMIN), deleteCompany);

export default router;
