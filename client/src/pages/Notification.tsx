import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useUser } from "../contexts/UserContext";
import { Header } from "../components/layout/Header";
import { AvatarImage } from "../components/ui/OptimizedImage";
import type { Notification } from "../types/notification";

export default function NotificationPage() {
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const { getDashboardRoute } = useUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setMenuOpenId(null);

    try {
      await deleteNotification(id);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId((prevId) => (prevId === id ? null : id));
  };

  const formatTime = (timestamp: string): string => {
    // Existing formatTime function unchanged
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title="Notifications"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="space-y-6 mb-7">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  All Notifications
                </h1>
                <p className="text-gray-600">
                  {notifications.length} total notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({unreadCount} unread)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Link to={getDashboardRoute()} className="btn btn-secondary">
                  ← Back to Dashboard
                </Link>

                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn btn-primary">
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  You'll see notifications here when there's activity in the
                  system.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                      !notification.isRead
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    } ${deletingId === notification.id ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {notification.newUser ? (
                          <Link
                            to={`/profile/${notification.newUser.id}`}
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {typeof notification.newUser.avatar === "string" ? (
                              <img
                                src={notification.newUser.avatar}
                                alt={notification.newUser.firstName}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                              />
                            ) : (
                              <AvatarImage
                                user={{
                                  firstName:
                                    notification.newUser.firstName || "",
                                  lastName: notification.newUser.lastName || "",
                                  avatar: notification.newUser.avatar,
                                }}
                                context="notification"
                              />
                            )}
                          </Link>
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              👤
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-gray-700 mb-2">
                              {notification.message}
                            </p>

                            {notification.newUser && (
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {notification.newUser.role
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                                <Link
                                  to={`/profile/${notification.newUser.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Profile →
                                </Link>
                              </div>
                            )}

                            <p className="text-sm text-gray-500">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                                <span className="text-xs font-medium text-blue-600">
                                  NEW
                                </span>
                              </div>
                            )}

                            <div className="relative">
                              <button
                                onClick={(e) => toggleMenu(notification.id, e)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={deletingId === notification.id}
                              >
                                <svg
                                  className="w-5 h-5 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {menuOpenId === notification.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    {!notification.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) =>
                                        handleDeleteClick(notification.id, e)
                                      }
                                      disabled={deletingId === notification.id}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      {deletingId === notification.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Click outside handler to close menus */}
      {menuOpenId && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
}
