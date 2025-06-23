import { useState, useCallback } from "react";
import { userService } from "../../../services/users";
import { useAuth } from "../../../contexts/AuthContext";
import type { User } from "../../../types/user";

export const useUser = () => {
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfileUser = useCallback(
    async (userId?: string) => {
      if (!currentUser) return;

      setLoading(true);
      setError("");

      if (!userId) {
        setProfileUser(currentUser);
        setLoading(false);
        return;
      }

      try {
        const result = await userService.getUserById(userId);

        if (result.success && result.user) {
          setProfileUser(result.user);
        } else {
          setError(result.error || "Failed to load user profile");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    profileUser,
    loading,
    error,
    fetchProfileUser,
    clearError,
    setProfileUser,
  };
};
