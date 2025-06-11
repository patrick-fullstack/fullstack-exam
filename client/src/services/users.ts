import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import type { User, ApiErrorResponse } from "../types/User";
import type { CreateUserData } from "../types/User";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const userService = {
  /**
   * Create a new user (Super Admin only)
   */
  async createUser(userData: CreateUserData) {
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("firstName", userData.firstName);
      formData.append("lastName", userData.lastName);
      formData.append("phone", userData.phone);
      formData.append("role", userData.role);

      // Add company ID if provided
      if (userData.companyId) {
        formData.append("companyId", userData.companyId);
      }

      // Add avatar file if provided
      if (userData.avatar) {
        formData.append("avatar", userData.avatar);
      }

      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user as User,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "User creation failed",
      };
    } catch (error) {
      console.error("Create user error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "User creation failed",
        };
      }

      return {
        success: false,
        error: "User creation failed",
      };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    try {
      const response = await api.get(`/users/${userId}`);

      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user as User,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch user",
      };
    } catch (error) {
      console.error("Get user by ID error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to fetch user",
        };
      }

      return {
        success: false,
        error: "Failed to fetch user",
      };
    }
  },

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    isActive?: boolean;
  }) {
    try {
      const response = await api.get("/users", { params });

      if (response.data.success) {
        return {
          success: true,
          data: {
            users: response.data.data.users as User[],
            pagination: {
              currentPage: response.data.data.pagination.currentPage,
              totalPages: response.data.data.pagination.totalPages,
              totalUsers: response.data.data.pagination.totalUsers,
              hasNextPage: response.data.data.pagination.hasNextPage,
              hasPrevPage: response.data.data.pagination.hasPrevPage,
              usersPerPage: response.data.data.pagination.usersPerPage,
            },
          },
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch users",
      };
    } catch (error) {
      console.error("Get users error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to fetch users",
        };
      }

      return {
        success: false,
        error: "Failed to fetch users",
      };
    }
  },

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: string;
      isActive?: boolean;
      avatar?: File;
      password?: string;
    }
  ) {
    try {
      const formData = new FormData();

      // Add fields that are provided
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "avatar" && value instanceof File) {
            formData.append(key, value);
          } else if (key !== "avatar") {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api.put(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return {
          success: true,
          user: response.data.data.user as User,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "User update failed",
      };
    } catch (error) {
      console.error("Update user error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "User update failed",
        };
      }

      return {
        success: false,
        error: "User update failed",
      };
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    try {
      const response = await api.delete(`/users/${userId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "User deletion failed",
      };
    } catch (error) {
      console.error("Delete user error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "User deletion failed",
        };
      }

      return {
        success: false,
        error: "User deletion failed",
      };
    }
  },
};
