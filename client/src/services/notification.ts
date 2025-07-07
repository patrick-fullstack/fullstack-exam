import axios from "axios";
import type { Notification } from "../types/notification";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with session support
const api = axios.create({
  baseURL: `${API_URL}/notifications`,
  timeout: 10000,
  withCredentials: true, // Essential for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Notification API error:", error);
    
    // Handle session expiration
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get("/");
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await api.patch(`/${id}/read`);
      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await api.patch("/mark-all-read");
      return true;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return false;
    }
  },

  async deleteNotification(id: string): Promise<boolean> {
    try {
      await api.delete(`/${id}`);
      return true;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return false;
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/unread-count");
      return response.data.success ? response.data.count : 0;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  },
};