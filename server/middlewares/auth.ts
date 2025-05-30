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
    try {
      // 1. Extract token from Authorization header
      const token = extractTokenFromHeader(req.headers.authorization);

      // 2. Verify the token and get payload
      const payload = verifyToken(token);

      // 3. Find user in database to ensure they still exist and are active
      const user = await User.findById(payload.userId).select("-password"); // Exclude password

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

      // 4. Attach user and token payload to request object
      req.user = user;
      req.tokenPayload = payload;

      // 5. Continue to next middleware/route handler
      next();
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || "Authentication failed",
      });
    }
  }
);

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated first
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    // User has required role, continue - proceed to next middleware/route handler
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

// will remove if not needed
// Optional authentication middleware (for public routes that can be enhanced with auth)
export const optionalAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Try to extract token
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = extractTokenFromHeader(authHeader);
        const payload = verifyToken(token);

        // Find user if token is valid
        const user = await User.findById(payload.userId).select("-password");

        if (user && user.isActive) {
          req.user = user;
          req.tokenPayload = payload;
        }
      }

      // Continue regardless of authentication status
      next();
    } catch (error) {
      // If token is invalid, just continue without user
      next();
    }
  }
);
