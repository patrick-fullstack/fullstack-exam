import React from "react";
import { Link } from "react-router-dom";
import { NotificationBell } from "../ui/NotificationBell";
import type { ImageFormats } from "../../types/image-format";

interface HeaderProps {
  title: string;
  subtitle?: string;
  variant?: "login" | "dashboard";
  onLogout?: () => void;
  userAvatar?: ImageFormats | string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  variant = "login",
  onLogout,
  userAvatar,
  userName,
}) => {
  // Login header (with logo)
  if (variant === "login") {
    return (
      <div className="text-center mb-6 sm:mb-8 px-4">
        {/* Logo */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-600 rounded-xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <span className="text-white text-lg sm:text-2xl md:text-3xl font-bold">
            C
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 px-4">{subtitle}</p>
        )}
      </div>
    );
  }

  // Dashboard header (horizontal with profile and logout)
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side - Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>

          {/* Right side - Profile and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Profile Link */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                title="Edit Profile"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {userAvatar ? (
                    <img
                      src={
                        typeof userAvatar === "string"
                          ? userAvatar
                          : userAvatar.thumbnail ||
                            userAvatar.small ||
                            userAvatar.medium ||
                            userAvatar.original ||
                            ""
                      }
                      alt="Profile"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                      {userName ? userName.charAt(0).toUpperCase() : "👤"}
                    </div>
                  )}
                </div>

                {/* User Name (hidden on mobile) */}
                {userName && (
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-32 truncate">
                    {userName}
                  </span>
                )}

                {/* Profile Text (hidden on smaller screens) */}
                <span className="hidden lg:block text-sm text-gray-500">
                  Profile
                </span>
              </Link>

              {/* Mobile Notifications */}
              <div className="sm:hidden">
                <NotificationBell />
              </div>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-green-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <span className="hidden md:inline">Logout</span>
                  <svg
                    className="w-4 h-4 md:ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              )}

              {/* Mobile Menu Button (for logout) */}
              {onLogout && (
                <div className="sm:hidden">
                  <button
                    onClick={onLogout}
                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors duration-200"
                    title="Logout"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
