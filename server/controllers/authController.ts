import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateUserToken } from '../utils/jwt';
import { asyncHandler } from '../middlewares/errorHandler';

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
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
      role: string;
      companyId?: string;
    };
    token: string;
    expiresIn: string;
  };
}

// Login controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    // 1. Extract email and password from request body
    const { email, password }: LoginRequest = req.body;

    // 2. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 3. Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // 5. Compare password using the model method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 6. Generate JWT token
    const tokenData = generateUserToken({
      _id: user._id.toString(), // typescript will identify this _id is ObjectId
      email: user.email,
      role: user.role,
      companyId: user.companyId?.toString()
    });

    // 7. Prepare user data (exclude sensitive information)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId?.toString()
    };

    // 8. Send successful response
    const response: LoginResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: tokenData.token,
        expiresIn: tokenData.expiresIn
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get current user profile (protected route)
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    // User is available from authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Prepare user data
    const userData = {
      id: req.user._id.toString(),
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      companyId: req.user.companyId?.toString(),
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: userData
      }
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout controller (optional - for token blacklisting in future)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // For now, just send success response
  // will create a token blacklist in future to invalidate tokens
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});