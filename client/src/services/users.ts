import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import type { CreateUserData } from "../components/forms/CreateUserForm";

const API_URL = import.meta.env.VITE_API_URL;

// API Error response interface
interface ApiErrorResponse {
  success: false;
  message: string;
}

// User response interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: string;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
          users: response.data.data.users as User[],
          pagination: response.data.data.pagination,
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
};
