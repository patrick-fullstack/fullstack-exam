import axios, { AxiosError } from "axios";
import type {
  User,
  LoginRequest,
  UpdateProfileRequest,
  ApiErrorResponse,
} from "../types/user";

const API_URL = import.meta.env.VITE_API_URL;

class AuthEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  emit() {
    this.listeners.forEach((callback) => callback());
  }
}

export const authEvents = new AuthEventEmitter();

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// Completely remove the interceptor that was causing loops
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // No automatic auth event emissions - this was causing the loops
    return Promise.reject(error);
  }
);

// Session cache to reduce server calls
let sessionCache: { isAuthenticated: boolean; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 10000; // 10 seconds

export const auth = {
  async login(email: string, password: string, requiredRole?: string) {
    try {
      const requestBody: LoginRequest = { email, password };

      if (requiredRole) {
        requestBody.requiredRole = requiredRole;
      }

      const response = await api.post("/auth/login", requestBody);

      if (response.data.success) {
        // Clear session cache on login
        sessionCache = null;
        // Only emit on successful login
        authEvents.emit();
        return { success: true, user: response.data.data.user };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Login failed",
          actualRole: apiError.actualRole,
        };
      }

      return { success: false, error: "Login failed" };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get("/auth/me");
      
      if (response.data.success) {
        return response.data.data.user;
      }
      
      return null;
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, data: UpdateProfileRequest) {
    try {
      const formData = new FormData();

      if (data.firstName) formData.append("firstName", data.firstName);
      if (data.lastName) formData.append("lastName", data.lastName);
      if (data.phone) formData.append("phone", data.phone);
      if (data.email) formData.append("email", data.email);
      if (data.password) formData.append("password", data.password);

      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      const response = await api.put(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Clear session cache on profile update
        sessionCache = null;
        // Only emit on successful update
        authEvents.emit();
        return { success: true, user: response.data.data.user };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Update failed",
        };
      }

      return {
        success: false,
        error: "Update failed",
      };
    }
  },

  async checkSession(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached result if recent - this prevents excessive API calls
    if (sessionCache && (now - sessionCache.timestamp) < SESSION_CACHE_DURATION) {
      return sessionCache.isAuthenticated;
    }

    try {
      const response = await api.get("/auth/session");
      const isAuthenticated = response.data.success && response.data.data.isAuthenticated;
      
      // Cache the result
      sessionCache = {
        isAuthenticated,
        timestamp: now
      };
      
      return isAuthenticated;
    } catch {
      // Cache negative result to prevent repeated failed calls
      sessionCache = {
        isAuthenticated: false,
        timestamp: now
      };
      return false;
    }
  },

  async isLoggedIn(): Promise<boolean> {
    return await this.checkSession();
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout errors are not critical
    } finally {
      // Clear session cache on logout
      sessionCache = null;
      // Only emit on logout
      authEvents.emit();
    }
  },
};