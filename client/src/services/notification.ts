import { auth } from "./auth";
import type { Notification } from "../types/notification";

const API_URL = import.meta.env.VITE_API_URL;

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    const token = auth.getToken();
    const response = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    return result.success ? result.data : [];
  },

  async markAsRead(id: string): Promise<void> {
    const token = auth.getToken();
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async markAllAsRead(): Promise<void> {
    const token = auth.getToken();
    await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
