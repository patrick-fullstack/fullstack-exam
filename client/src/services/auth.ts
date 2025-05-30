import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// Define interfaces for request and user data
export interface LoginRequest {
  email: string;
  password: string;
}

// Define the structure of the user object returned by the API
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Automatically add token to all requests
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

// Handle token expiration automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear it and redirect to login
      Cookies.remove("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  // Login
  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // Store in cookies
        Cookies.set("token", response.data.data.token, { expires: 1 });
        return { success: true, user: response.data.data.user };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  },

  // Get current user from cookies
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success && response.data.data.user) {
        return response.data.data.user;
      }

      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Check if logged in
  isLoggedIn(): boolean {
    return !!Cookies.get("token");
  },

  getToken(): string | undefined {
    return Cookies.get("token");
  },

  // Logout
  async logout() {
    try {
      // Call server logout endpoint
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear token locally
      Cookies.remove("token");
    }
  },
};
