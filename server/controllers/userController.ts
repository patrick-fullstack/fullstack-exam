import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { asyncHandler } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";
import { uploadToCloudinary } from "../utils/cloudinary";

const formatUser = (user: any) => ({
  id: user._id.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  companyId: user.companyId?.toString(),
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Get all users (Super Admin sees all, Manager sees their company employees)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = req.user!;

  const { page = 1, limit = 10, role, search, isActive } = req.query;

  // Build filter based on user role
  let filter: any = {};

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can see all users
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filter.role = role;
    }
  } else if (currentUser.role === UserRole.MANAGER) {
    // Manager can only see employees in their company
    filter.companyId = currentUser.companyId;
    filter.role = UserRole.EMPLOYEE;
  } else {
    // Employees cannot access this endpoint
    return res.status(403).json({
      success: false,
      message: "Insufficient permissions to view users",
    });
  }

  // Apply filters
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const pageNumber = Math.max(1, parseInt(page as string));
  const limitNumber = Math.max(1, parseInt(limit as string));
  const skip = (pageNumber - 1) * limitNumber;

  const totalUsers = await User.countDocuments(filter);

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: {
      users: users.map(formatUser),
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        hasNextPage: pageNumber < Math.ceil(totalUsers / limitNumber),
        hasPrevPage: pageNumber > 1,
        usersPerPage: limitNumber,
      },
    },
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUser = req.user!;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check access permissions
  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can see anyone
  } else if (currentUser.role === UserRole.MANAGER) {
    // Manager can only see employees in their company
    if (
      user.role !== UserRole.EMPLOYEE ||
      user.companyId?.toString() !== currentUser.companyId?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only view employees in your company",
      });
    }
  } else if (currentUser.role === UserRole.EMPLOYEE) {
    // Employee can only see themselves
    if (currentUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile",
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: { user: formatUser(user) },
  });
});

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUser = req.user!;
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    companyId,
    isActive,
    password,
  } = req.body;

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check access permissions and determine what can be updated
  let updateData: any = {};

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can update everything
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (companyId !== undefined) updateData.companyId = companyId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
  } else if (currentUser.role === UserRole.MANAGER) {
    // Manager can update employees in their company OR their own profile
    if (currentUser._id.toString() === userId) {
      // Manager updating their own profile
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }
    } else {
      // Manager updating an employee
      if (
        targetUser.role !== UserRole.EMPLOYEE ||
        targetUser.companyId?.toString() !== currentUser.companyId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only update employees in your company or your own profile",
        });
      }

      // Manager can update limited fields for employees
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (isActive !== undefined) updateData.isActive = isActive;
      // Note: Managers cannot change employee passwords
    }
  } else if (currentUser.role === UserRole.EMPLOYEE) {
    // Employee can only update themselves and allowed fields
    if (currentUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile",
      });
    }

    // Allow employees to update their own profile fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
  }

  // Handle avatar upload
  if (req.file) {
    try {
      const avatarUrl = await uploadToCloudinary(req.file.buffer);
      updateData.avatar = avatarUrl;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload avatar",
      });
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: { user: formatUser(updatedUser!) },
  });
});

// Delete user (Super Admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUser = req.user!;

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Prevent self-deletion
  if (currentUser._id.toString() === userId) {
    return res.status(403).json({
      success: false,
      message: "Cannot delete your own account",
    });
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Get user statistics (Super Admin only) - for total users etc
export const getUserStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: ["$isActive", 1, 0],
            },
          },
          inactive: {
            $sum: {
              $cond: ["$isActive", 0, 1],
            },
          },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          active: 1,
          inactive: 1,
          _id: 0,
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleBreakdown: stats,
      },
    });
  }
);
