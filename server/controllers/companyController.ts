import { Request, Response } from "express";
import { Company } from "../models/Company";
import { User, UserRole } from "../models/User";
import { asyncHandler } from "../middlewares/errorHandler";
import { uploadToCloudinary } from "../utils/cloudinary";
import { validateFileUpload } from "../middlewares/upload";

// For populating user data in company responses
function formatUserData(user: any) {
  if (!user) return undefined;

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatar: user.avatar,
  };
}

const formatCompany = (company: any) => ({
  id: company._id.toString(),
  name: company.name,
  email: company.email,
  logo: company.logo,
  website: company.website,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt,
  users: company.users ? company.users : undefined,
  userPagination: company.userPagination,
});

// Get all companies - super admin sees all, manager sees their company
export const getAllCompanies = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = req.user!;
    const { page = 1, limit = 6, search } = req.query;

    let filter: any = {};
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Suoer admin can see all companies
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { website: { $regex: search, $options: "i" } },
        ];
      }
    } else if (currentUser.role === UserRole.MANAGER) {
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { website: { $regex: search, $options: "i" } },
        ];
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Insufficient permission to view companies",
      });
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.max(1, parseInt(limit as string));
    const skip = (pageNumber - 1) * limitNumber;

    const [totalCompanies, companies] = await Promise.all([
      Company.countDocuments(filter),
      Company.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
    ]);

    res.status(200).json({
      success: true,
      message: "COmpanies retrieved successfully",
      data: {
        companies: companies.map(formatCompany),
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCompanies / limitNumber),
          totalCompanies,
          hasNextPage: pageNumber < Math.ceil(totalCompanies / limitNumber),
          hasPrevPage: pageNumber > 1,
          companiesPerPage: limitNumber,
        },
      },
    });
  }
);

// Get company by ID
export const getCompanyById = asyncHandler(
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const currentUser = req.user!;

    // Get query params for user pagination
    const {
      userPage = 1,
      userLimit = 10,
      userSearch,
      userRole,
      userStatus,
    } = req.query;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Build user filter based on permissions and queries
    let userFilter: any = { companyId: companyId };

    // Check access permissions
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin can see any company with all users
      // Add role filter if specified
      if (userRole && Object.values(UserRole).includes(userRole as UserRole)) {
        userFilter.role = userRole;
      }
    } else if (currentUser.role === UserRole.MANAGER) {
      // Manager can view any company with all users (NO RESTRICTION)
      // Add role filter if specified
      if (userRole && Object.values(UserRole).includes(userRole as UserRole)) {
        userFilter.role = userRole;
      }
    } else if (currentUser.role === UserRole.EMPLOYEE) {
      // Employee can only view their own company
      if (currentUser.companyId?.toString() !== companyId) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own company",
        });
      }
      // Employees see all colleagues (including managers)
    }

    // Search filter
    if (userSearch) {
      userFilter.$or = [
        { firstName: { $regex: userSearch, $options: "i" } },
        { lastName: { $regex: userSearch, $options: "i" } },
        { email: { $regex: userSearch, $options: "i" } },
      ];
    }

    // Status filter
    if (userStatus !== undefined) {
      userFilter.isActive = userStatus === "true";
    }

    // Pagination for users
    const userPageNumber = Math.max(1, parseInt(userPage as string));
    const userLimitNumber = Math.max(1, parseInt(userLimit as string));
    const userSkip = (userPageNumber - 1) * userLimitNumber;

    // Get total user count and paginated users
    const [totalUsers, users] = await Promise.all([
      User.countDocuments(userFilter),
      User.find(userFilter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(userSkip)
        .limit(userLimitNumber),
    ]);

    // Calculate user pagination metadata
    const userPagination = {
      currentPage: userPageNumber,
      totalPages: Math.ceil(totalUsers / userLimitNumber),
      totalUsers,
      hasNextPage: userPageNumber < Math.ceil(totalUsers / userLimitNumber),
      hasPrevPage: userPageNumber > 1,
      usersPerPage: userLimitNumber,
    };

    // Response object
    const responseData = {
      ...company.toObject(),
      users: users.map(formatUserData),
      userPagination,
    };

    return res.status(200).json({
      success: true,
      message: "Company retrieved successfully",
      data: {
        company: formatCompany(responseData),
        userPagination,
      },
    });
  }
);

// Create company - for super admin only
export const createCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = req.user!;

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can create companies",
      });
    }

    const { name, email, website } = req.body;

    // Validate required fiels
    if (!name || !email || !website) {
      return res.status(400).json({
        success: false,
        message: "Company name, email, and website are required",
      });
    }

    // Check if company aready exists
    const existingCompany = await Company.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        { website: { $regex: new RegExp(`^${website}$`, "i") } },
      ],
    });
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company already exists",
      });
    }

    // Create company data object
    const companyData: any = {
      name,
      email: email,
      website: website,
    };

    //Handle logo upload if file is provided
    if (req.file) {
      // Validate file before uploading
      if (!validateFileUpload(req.file, res)) return;

      const logoUrl = await uploadToCloudinary(
        req.file.buffer,
        "company-logos"
      );
      companyData.logo = logoUrl;
    }

    const newCompany = await Company.create(companyData);
    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: { company: formatCompany(newCompany) },
    });
  }
);

// Update company
export const updateCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const currentUser = req.user!;
    const { name, email, website } = req.body;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Check permission
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin can update any company
    } else if (currentUser.role === UserRole.MANAGER) {
      // Manager can only update their company
      if (currentUser.companyId?.toString() !== companyId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own company",
        });
      }
    } else {
      // Employees cant update companies
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to update company",
      });
    }

    // Update data
    const updateData: any = {};

    if (name !== undefined) {
      // check if new name conflicts with existing company
      const existingCompany = await Company.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: companyId }, // Exclude current company
      });

      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: "Company witht this name already exists",
        });
      }
      updateData.name = name;
    }

    if (email !== undefined) {
      // check if new email conflicts with existing company
      const existingCompany = await Company.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        _id: { $new: companyId }, // Exclude current company
      });

      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: "Company witht this email already exists",
        });
      }
      updateData.email = email;
    }

    if (website !== undefined) {
      // check if new email conflicts with existing company
      const existingCompany = await Company.findOne({
        website: { $regex: new RegExp(`^${website}$`, "i") },
        _id: { $new: companyId }, // Exclude current company
      });

      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: "Company witht this website already exists",
        });
      }
      updateData.website = website;
    }

    // Handle logo upload
    if (req.file) {
      // Validate file before uploading
      if (!validateFileUpload(req.file, res)) return;

      const logoUrl = await uploadToCloudinary(
        req.file.buffer,
        "company-logos"
      );
      updateData.logo = logoUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: { company: formatCompany(updatedCompany!) },
    });
  }
);

// Delete company - super admin only
export const deleteCompany = asyncHandler(
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can delete companies",
      });
    }

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await Company.findByIdAndDelete(companyId);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  }
);
