import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// Define interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId?: string;
}

// Event emitter for auth events
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
  timeout: 10000,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      authEvents.emit(); // Emit logout event
    }
    return Promise.reject(error);
  }
);

export const auth = {
  async login(email: string, password: string) {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        Cookies.set("token", response.data.data.token, { expires: 1 });

        // Emit event to trigger App.tsx to re-check auth
        authEvents.emit();

        return { success: true, user: response.data.data.user };
      }

      return { success: false, error: response.data.message };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

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

  isLoggedIn(): boolean {
    return !!Cookies.get("token");
  },

  getToken(): string | undefined {
    return Cookies.get("token");
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("token");
      authEvents.emit();
    }
  },
};
