import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './AuthContext';
import { auth } from '../services/auth';

interface Notification {
    id: string;
    type: 'user_created' | 'user_updated' | 'user_deleted';
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

interface NotificationData {
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

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pusher, setPusher] = useState<Pusher | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch notifications from database when user logs in
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated, user]);

    const fetchNotifications = async () => {
        const token = auth.getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (result.success) {
            setNotifications(result.data);
        }
    };

    // Pusher real-time connection
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (pusher) {
                pusher.disconnect();
                setPusher(null);
            }
            setIsConnected(false);
            return;
        }

        const token = auth.getToken();
        if (!token) {
            setIsConnected(false);
            return;
        }

        const pusherInstance = new Pusher(import.meta.env.PUSHER_KEY, {
            cluster: import.meta.env.PUSHER_CLUSTER,
            authEndpoint: `${import.meta.env.VITE_API_URL}/notifications/pusher/auth`,
            auth: {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        });

        pusherInstance.connection.bind('connected', () => {
            setIsConnected(true);
        });

        pusherInstance.connection.bind('disconnected', () => {
            setIsConnected(false);
        });

        pusherInstance.connection.bind('error', () => {
            setIsConnected(false);
        });

        const channelName = `private-user-${user.id}`;
        const channel = pusherInstance.subscribe(channelName);

        channel.bind('pusher:subscription_succeeded', () => {
            setIsConnected(true);
        });

        channel.bind('pusher:subscription_error', () => {
            setIsConnected(false);
        });

        // Listen for new notifications from Pusher
        channel.bind('new-user-notification', (data: NotificationData) => {
            const notification: Notification = {
                id: data.id || `${Date.now()}-${Math.random()}`,
                type: data.type as 'user_created' | 'user_updated' | 'user_deleted',
                title: data.title,
                message: data.message,
                newUser: data.newUser,
                profileUrl: data.profileUrl,
                timestamp: data.timestamp,
                isRead: false
            };

            setNotifications(prev => [notification, ...prev]);

            // Browser notification
            if (Notification.permission === 'granted') {
                const browserNotification = new Notification(data.title, {
                    body: data.message,
                    icon: data.newUser?.avatar || '/vite.svg'
                });

                setTimeout(() => {
                    browserNotification.close();
                }, 5000);
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
        if (isAuthenticated && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [isAuthenticated]);

    const markAsRead = async (id: string) => {
        const token = auth.getToken();
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = async () => {
        const token = auth.getToken();
        await fetch(`${import.meta.env.VITE_API_URL}/notifications/mark-all-read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const contextValue: NotificationContextType = {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearNotifications
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};