import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { asyncHandler } from "../middlewares/errorHandler";
import bcrypt from "bcryptjs";

// Get all users (Super Admin sees all, Manager sees their company employees)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = req.user!;
  
  const {
    page = 1,
    limit = 10,
    role,
    search,
    isActive
  } = req.query;

  // Build filter based on user role
  let filter: any = {};

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can see all users
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filter.role = role;
    }
  } 
  else if (currentUser.role === UserRole.MANAGER) {
    // Manager can only see employees in their company
    filter.companyId = currentUser.companyId;
    filter.role = UserRole.EMPLOYEE;
  } 
  else {
    // Employees cannot access this endpoint
    return res.status(403).json({
      success: false,
      message: "Insufficient permissions to view users"
    });
  }

  // Apply filters
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const pageNumber = Math.max(1, parseInt(page as string));
  const limitNumber = Math.max(1, parseInt(limit as string));
  const skip = (pageNumber - 1) * limitNumber;

  const totalUsers = await User.countDocuments(filter);
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const formattedUsers = users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId?.toString(),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: {
      users: formattedUsers,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        hasNextPage: pageNumber < Math.ceil(totalUsers / limitNumber),
        hasPrevPage: pageNumber > 1,
        usersPerPage: limitNumber
      }
    }
  });
});

// Get user by ID 
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUser = req.user!;

  const user = await User.findById(userId).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Check access permissions
  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can see anyone
  } 
  else if (currentUser.role === UserRole.MANAGER) {
    // Manager can only see employees in their company
    if (user.role !== UserRole.EMPLOYEE || user.companyId?.toString() !== currentUser.companyId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view employees in your company"
      });
    }
  } 
  else if (currentUser.role === UserRole.EMPLOYEE) {
    // Employee can only see themselves
    if (currentUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile"
      });
    }
  }

  const formattedUser = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId?.toString(),
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: { user: formattedUser }
  });
});

// Update user 
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUser = req.user!;
  const { firstName, lastName, email, role, companyId, isActive, password } = req.body;

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Check access permissions and determine what can be updated
  let updateData: any = {};

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    // Super admin can update everything
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (companyId !== undefined) updateData.companyId = companyId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
  } 
  else if (currentUser.role === UserRole.MANAGER) {
    // Manager can only update employees in their company
    if (targetUser.role !== UserRole.EMPLOYEE || targetUser.companyId?.toString() !== currentUser.companyId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update employees in your company"
      });
    }
    
    // Manager can update limited fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (isActive !== undefined) updateData.isActive = isActive;
  } 
  else if (currentUser.role === UserRole.EMPLOYEE) {
    // Employee can only update themselves and only password
    if (currentUser._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update"
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user: {
        id: updatedUser!._id.toString(),
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        role: updatedUser!.role,
        companyId: updatedUser!.companyId?.toString(),
        isActive: updatedUser!.isActive,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      },
    },
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
      message: "User not found"
    });
  }

  // Prevent self-deletion
  if (currentUser._id.toString() === userId) {
    return res.status(403).json({
      success: false,
      message: "Cannot delete your own account"
    });
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

// Get user statistics (Super Admin only) - for total users etc
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: ['$isActive', 1, 0]
          }
        },
        inactive: {
          $sum: {
            $cond: ['$isActive', 0, 1]
          }
        }
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        active: 1,
        inactive: 1,
        _id: 0
      }
    }
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
      roleBreakdown: stats
    }
  });
});