export interface Notification {
  id: string;
  type: "user_created" | "user_updated" | "user_deleted";
  title: string;
  message: string;
  newUser?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  profileUrl: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationData {
  id?: string;
  type: string;
  title: string;
  message: string;
  newUser?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  profileUrl: string;
  timestamp: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
