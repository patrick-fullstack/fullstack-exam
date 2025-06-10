import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { generateUserToken } from "../utils/jwt";
import { asyncHandler } from "../middlewares/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { validateFileUpload } from "../middlewares/upload";
import { notifyUsersOfNewUser } from "../services/notificationService";

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
  requiredRole?: UserRole;
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
      avatar?: string;
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
    token: string;
    expiresIn: string;
  };
}

// Register request interface
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  companyId?: string;
}

// Format populated company data
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

// Login controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, requiredRole }: LoginRequest = req.body;

  // Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  // Find and validate user
  const user = await User.findOne({ email })
    .select("+password")
    .populate("companyId", "name email website logo");
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact administrator.",
    });
  }

  // Verify password
  if (!(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  // Check role before issueing token - NEW FEATURE FOR ROLE-BASED LOGIN IN FRONTEND
  if (requiredRole && user.role !== requiredRole) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This portal is for ${requiredRole.replace(
        "_",
        " "
      )}s only. You are a ${user.role.replace("_", " ")}.`,
      actualRole: user.role,
    });
  }

  // Generate token and respond
  const tokenData = generateUserToken({
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
    companyId: user.companyId?._id?.toString(),
  });

  // Prepare response data - using LoginResponse interface
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
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
    },
  };

  res.status(200).json(response);
});

// Register controller
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    companyId,
  }: RegisterRequest = req.body;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({
      success: false,
      message: "Email, password, firstName, lastName, and role are required",
    });
  }

  // Validate role
  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role specified",
    });
  }

  // Validate companyId for non-super admin roles
  if (role !== UserRole.SUPER_ADMIN && !companyId) {
    return res.status(400).json({
      success: false,
      message: "CompanyId is required for manager and employee roles",
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  // Create new user
  const userData: any = {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  };

  // Add companyId if provided (for managers and employees)
  if (companyId) {
    userData.companyId = companyId;
  }

  // Handle avatar upload if file is provided
  if (req.file) {
    // Validate file before uploading
    if (!validateFileUpload(req.file, res)) return;

    const avatarUrl = await uploadToCloudinary(req.file.buffer, "user-avatars");
    userData.avatar = avatarUrl;
  }

  const newUser = await User.create(userData);

  // SEnd notifications to managers and employees
  await notifyUsersOfNewUser(newUser);

  // Return user data (excluding password)
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

// Refresj token controller
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // User is available from authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if user is still active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator.",
      });
    }

    // Generate new token with same payload structure as login
    const tokenData = generateUserToken({
      _id: req.user._id.toString(),
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId?.toString(),
    });

    // Return new token (same format as login response)
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: tokenData.token,
        expiresIn: tokenData.expiresIn,
      },
    });
  }
);

// Get current user profile (protected route)
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    // User is available from authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    // Fetch user with populated company details
    const userWithCompany = await User.findById(req.user._id)
      .populate("companyId", "name email website logo")
      .select("-password");

    if (!userWithCompany) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare user data
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
      data: {
        user: userData,
      },
    });
  }
);

// Logout controller (optional - for token blacklisting in future)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // For now, just send success response
  // will create a token blacklist in future to invalidate tokens
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
