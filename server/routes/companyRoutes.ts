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
import { handleMulterError, upload } from "../middlewares/upload";
import { UserRole } from "../models/User";

const router = express.Router();
router.use(authenticate);
router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  getAllCompanies
);
router.get(
  "/export/:companyId",
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
  handleMulterError(upload.single("logo")),
  authorize(UserRole.SUPER_ADMIN),
  createCompany
);
router.put(
  "/:companyId",
  handleMulterError(upload.single("logo")),
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER),
  updateCompany
);
router.delete("/:companyId", authorize(UserRole.SUPER_ADMIN), deleteCompany);

export default router;
