import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { User, UserRole, IUser } from "../models/User";
import { asyncHandler } from "../middlewares/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { validateFileUpload } from "../middlewares/upload";
import { notifyUsersOfNewUser } from "../services/notificationService";
import { Company } from "../models/Company";

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
  requiredRole?: UserRole;
}

// Extend Request interface to include typed body
interface AuthenticatedRequest extends Request {
  body: LoginRequest;
}

// Login response interface
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      avatar?: {
        original?: string;
        thumbnail?: string;
        small?: string;
        medium?: string;
      };
      role: string;
      companyId?: string;
      isActive: boolean;
      company?: {
        id: string;
        name: string;
        email: string;
        website: string;
        logo?: string;
      };
    };
  };
}

// Format company data utility
function formatCompanyData(companyId: any) {
  if (!companyId || typeof companyId !== "object") {
    return undefined;
  }
  return {
    id: companyId._id.toString(),
    name: companyId.name,
    email: companyId.email,
    website: companyId.website,
    logo: companyId.logo,
  };
}

// Helper function to get user ID safely
function getUserId(user: any): string | undefined {
  if (!user) return undefined;
  if (user.id) return user.id.toString();
  if (user._id) return user._id.toString();
  if (typeof user === "string") return user;

  return undefined;
}

// Login controller
export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Validate request body
    const { email, password, requiredRole } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Authentication error",
        });
      }

      if (!user) {
        const statusCode = info?.actualRole ? 403 : 401;
        return res.status(statusCode).json({
          success: false,
          message: info?.message || "Authentication failed",
          actualRole: info?.actualRole,
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Session creation failed",
          });
        }

        const response: LoginResponse = {
          success: true,
          message: "Login successful",
          data: {
            user: {
              id: user._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              avatar: user.avatar,
              role: user.role,
              companyId: user.companyId?._id?.toString(),
              isActive: user.isActive,
              company: formatCompanyData(user.companyId),
            },
          },
        };

        res.status(200).json(response);
      });
    })(req, res, next);
  }
);

// Register controller
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role, companyId } =
    req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      message: "Email, password, firstName, lastName, and role are required",
    });
  }

  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role specified",
    });
  }

  if (role !== UserRole.SUPER_ADMIN && !companyId) {
    return res.status(400).json({
      success: false,
      message: "CompanyId is required for manager and employee roles",
    });
  }

  if (companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (role === UserRole.MANAGER) {
      const existingManager = await User.findOne({
        companyId: companyId,
        role: UserRole.MANAGER,
      });

      if (existingManager) {
        return res.status(409).json({
          success: false,
          message:
            "This company already has a manager. Each company can only have one manager.",
        });
      }
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  const userData: any = {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  };

  if (companyId) {
    userData.companyId = companyId;
  }

  if (req.file) {
    if (!validateFileUpload(req.file, res, "user-avatars")) return;
    const avatarUrls = await uploadToCloudinary(
      req.file.buffer,
      "user-avatars"
    );
    userData.avatar = avatarUrls;
  }

  const newUser = await User.create(userData);

  setImmediate(async () => {
    await notifyUsersOfNewUser(newUser);
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        avatar: newUser.avatar,
        role: newUser.role,
        companyId: newUser.companyId?.toString(),
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    },
  });
});

// Get current user profile
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = req.user as IUser;
    const userId = getUserId(user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in session",
      });
    }

    const userWithCompany = await User.findById(userId)
      .populate("companyId", "name email website logo")
      .select("-password");

    if (!userWithCompany) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: userWithCompany._id.toString(),
      email: userWithCompany.email,
      firstName: userWithCompany.firstName,
      lastName: userWithCompany.lastName,
      phone: userWithCompany.phone,
      avatar: userWithCompany.avatar,
      role: userWithCompany.role,
      companyId: userWithCompany.companyId?._id?.toString(),
      isActive: userWithCompany.isActive,
      createdAt: userWithCompany.createdAt,
      updatedAt: userWithCompany.updatedAt,
      company: formatCompanyData(userWithCompany.companyId),
    };

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: { user: userData },
    });
  }
);

// Logout controller
export const logout = asyncHandler(async (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session cleanup failed",
        });
      }

      res.clearCookie("sessionId");
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    });
  });
});

// Session status check
export const checkSession = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if user is authenticated without requiring authentication
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const user = req.user as IUser;
      const userId = getUserId(user);

      res.status(200).json({
        success: true,
        message: "Session is active",
        data: {
          isAuthenticated: true,
          userId: userId,
        },
      });
    } else {
      res.status(200).json({
        success: false,
        message: "No active session",
        data: {
          isAuthenticated: false,
        },
      });
    }
  }
);