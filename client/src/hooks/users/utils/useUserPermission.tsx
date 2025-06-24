import { useCallback, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import type { User } from "../../../types/user";

interface UseUserPermissionsProps {
  profileUser: User | null;
}

export const useUserPermissions = ({
  profileUser,
}: UseUserPermissionsProps) => {
  const { user: currentUser } = useAuth();

  const isOwnProfile = useMemo(() => {
    return !!(currentUser && profileUser && currentUser.id === profileUser.id);
  }, [currentUser, profileUser]);

  const canEditProfile = useCallback(() => {
    if (!currentUser || !profileUser) return false;
    if (currentUser.id === profileUser.id) return true;
    if (currentUser.role === "super_admin") return true;
    if (currentUser.role === "manager") {
      return (
        profileUser.companyId === currentUser.companyId &&
        profileUser.role === "employee"
      );
    }
    return false;
  }, [currentUser, profileUser]);

  const canEditEmail = useCallback(() => {
    if (!currentUser || !profileUser) return false;
    return (
      currentUser.id === profileUser.id ||
      currentUser.role === "super_admin" ||
      (currentUser.role === "manager" &&
        profileUser.role === "employee" &&
        profileUser.companyId === currentUser.companyId)
    );
  }, [currentUser, profileUser]);

  const canEditCompany = useCallback(
    () => currentUser?.role === "super_admin",
    [currentUser]
  );

  return {
    isOwnProfile,
    canEditProfile,
    canEditEmail,
    canEditCompany,
  };
};
