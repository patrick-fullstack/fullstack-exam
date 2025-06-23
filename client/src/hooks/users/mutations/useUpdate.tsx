import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../services/users";
import { auth } from "../../../services/auth";
import { useAuth } from "../../../contexts/AuthContext";
import type { User, UpdateProfileRequest } from "../../../types/user";

interface UseUpdateProfileProps {
  profileUser: User | null;
  isOwnProfile: boolean;
  canEditProfile: () => boolean;
  onSuccess?: (updatedUser: User) => void;
}

export const useUpdateProfile = ({
  profileUser,
  isOwnProfile,
  canEditProfile,
  onSuccess,
}: UseUpdateProfileProps) => {
  const { user: currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateProfile = useCallback(
    async (updateData: UpdateProfileRequest) => {
      if (!profileUser || !canEditProfile()) {
        setError("You do not have permission to edit this profile");
        return;
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        return;
      }

      setUpdating(true);
      setError("");
      setSuccess("");

      try {
        const result = isOwnProfile
          ? await auth.updateProfile(profileUser.id, updateData)
          : await userService.updateUser(profileUser.id, updateData);

        if (result.success && result.user) {
          if (isOwnProfile) await refreshUser();

          setSuccess("Profile updated successfully!");

          if (onSuccess) {
            onSuccess(result.user);
          }

          setTimeout(() => setSuccess(""), 3000);
          navigate(
            profileUser.id !== currentUser?.id
              ? `/profile/${profileUser.id}`
              : "/profile"
          );
        } else {
          setError(result.error || "Update failed");
        }
      } catch (err) {
        console.error("Update profile error:", err);
        setError("An unexpected error occurred");
      } finally {
        setUpdating(false);
      }
    },
    [
      profileUser,
      canEditProfile,
      isOwnProfile,
      refreshUser,
      navigate,
      currentUser,
      onSuccess,
    ]
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    updateProfile,
    updating,
    error,
    success,
    clearMessages,
  };
};
