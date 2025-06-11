import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './AuthContext';
import { auth } from '../services/auth';
import { notificationService } from '../services/notification';
import type { Notification, NotificationData, NotificationContextType } from '../types/notification';

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
        const data = await notificationService.fetchNotifications();
        setNotifications(data);
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

        const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
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
        await notificationService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const markAllAsRead = async () => {
        await notificationService.markAllAsRead();
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