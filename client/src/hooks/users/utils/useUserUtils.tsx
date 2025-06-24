import { useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { User } from "../../../types/user";

interface UseUserUtilsProps {
  profileUser: User | null;
  isOwnProfile: boolean;
  isEditing: boolean;
}

export const useUserUtils = ({
  profileUser,
  isOwnProfile,
  isEditing,
}: UseUserUtilsProps) => {
  const { user: currentUser } = useAuth();

  const getDashboardRoute = useCallback(() => {
    if (!currentUser) return "/";

    switch (currentUser.role) {
      case "super_admin":
        return "/admin-dashboard";
      case "manager":
        return "/manager-dashboard";
      case "employee":
        return "/employee-dashboard";
      default:
        return "/";
    }
  }, [currentUser]);

  const getPageTitle = useCallback(() => {
    if (isEditing) return "Edit Profile";
    if (isOwnProfile) return "My Profile";
    return profileUser
      ? `${profileUser.firstName} ${profileUser.lastName}'s Profile`
      : "User Profile";
  }, [isEditing, isOwnProfile, profileUser]);

  const formatRole = useCallback(
    (role: string) =>
      role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    []
  );

  return {
    getDashboardRoute,
    getPageTitle,
    formatRole,
  };
};
