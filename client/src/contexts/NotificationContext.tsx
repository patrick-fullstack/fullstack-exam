import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Pusher from "pusher-js";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notification";
import type {
  Notification,
  NotificationData,
  NotificationContextType,
} from "../types/notification";
import { getImageUrl } from "../utils/imageUtils";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const shouldReceiveNotifications = (userRole: string) => {
    return ['manager', 'employee'].includes(userRole);
  };

  const fetchNotifications = async () => {
    if (user && shouldReceiveNotifications(user.role)) {
      try {
        const data = await notificationService.fetchNotifications();
        setNotifications(data);
      } catch {
        // Error is handled silently
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && shouldReceiveNotifications(user.role)) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (pusher) {
      pusher.disconnect();
      setPusher(null);
    }
    setIsConnected(false);

    if (!isAuthenticated || !user || !shouldReceiveNotifications(user.role)) {
      return;
    }

    // Fix: Use inline authorizer function without type annotations
    const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authorizer: function(channel) {
        return {
          authorize: function(socketId, callback) {
            fetch(`${import.meta.env.VITE_API_URL}/notifications/pusher/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              credentials: 'include',
              body: `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channel.name)}`
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              return response.json();
            })
            .then(data => callback(null, data))
            .catch(error => callback(error instanceof Error ? error : new Error('Authentication failed'), null));
          }
        };
      }
    });

    pusherInstance.connection.bind("connected", () => setIsConnected(true));
    pusherInstance.connection.bind("disconnected", () => setIsConnected(false));
    pusherInstance.connection.bind("error", () => setIsConnected(false));

    const channelName = `private-user-${user.id}`;
    const channel = pusherInstance.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => setIsConnected(true));
    channel.bind("pusher:subscription_error", () => setIsConnected(false));

    channel.bind("new-user-notification", (data: NotificationData) => {
      const notification: Notification = {
        id: data.id || `${Date.now()}-${Math.random()}`,
        type: data.type as "user_created",
        title: data.title,
        message: data.message,
        newUser: data.newUser,
        profileUrl: data.profileUrl,
        timestamp: data.timestamp,
        isRead: false,
      };

      setNotifications((prev) => [notification, ...prev]);

      if (Notification.permission === "granted") {
        const avatarUrl = data.newUser?.avatar
          ? getImageUrl(data.newUser.avatar, "thumbnail") || "/vite.svg"
          : "/vite.svg";

        new Notification(data.title, {
          body: data.message,
          icon: avatarUrl,
        });
      }
    });

    setPusher(pusherInstance);

    return () => {
      channel.unbind_all();
      pusherInstance.unsubscribe(channelName);
      pusherInstance.disconnect();
      setPusher(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && shouldReceiveNotifications(user.role) && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isAuthenticated, user]);

  const markAsRead = async (id: string) => {
    if (!user || !shouldReceiveNotifications(user.role)) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Error is handled silently
    }
  };

  const markAllAsRead = async () => {
    if (!user || !shouldReceiveNotifications(user.role)) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Error is handled silently
    }
  };

  const clearNotifications = () => setNotifications([]);

  const deleteNotification = async (id: string) => {
    if (!user || !shouldReceiveNotifications(user.role)) return false;
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
      return success;
    } catch {
      return false;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}