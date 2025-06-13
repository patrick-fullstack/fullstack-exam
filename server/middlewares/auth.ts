import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader, JWTPayload } from "../utils/jwt";
import { User, UserRole, IUser } from "../models/User";
import { asyncHandler } from "./errorHandler";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: JWTPayload;
    }
  }
}

// Authentication middleware - verifies if user is logged in
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractTokenFromHeader(req.headers.authorization);
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated",
      });
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  }
);

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

// Company-based authorization middleware (for managers and employees)
export const authorizeCompany = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Super admin can access all companies
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Get company ID from request parameters
  const requestedCompanyId = req.params.companyId;

  if (!requestedCompanyId) {
    return res.status(400).json({
      success: false,
      message: "Company ID is required",
    });
  }

  // Check if user belongs to the requested company
  if (req.user.companyId?.toString() !== requestedCompanyId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own company data",
    });
  }

  next();
};
