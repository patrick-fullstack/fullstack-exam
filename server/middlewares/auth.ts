import { Request, Response, NextFunction } from "express";
import { UserRole, IUser } from "../models/User";

declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: string;
    };
  }
}

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({
    success: false,
    message: "Authentication required",
  });
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "User not found in session",
      });
      return;
    }

    const user = req.user as IUser;

    if (!user.role || !allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const authorizeCompany = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "User not found in session",
    });
    return;
  }

  const user = req.user as IUser;

  if (user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  const requestedCompanyId = req.params.companyId;

  if (!requestedCompanyId) {
    res.status(400).json({
      success: false,
      message: "Company ID is required",
    });
    return;
  }

  if (user.companyId?.toString() !== requestedCompanyId) {
    res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own company data",
    });
    return;
  }

  next();
};