import { useState, useCallback } from "react";
import { userService } from "../../../services/users";
import type { CreateUserData } from "../../../types/user";

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetForm, setResetForm] = useState(false);

  const createUser = useCallback(async (userData: CreateUserData) => {
    setError("");
    setSuccess("");
    setLoading(true);
    setResetForm(false);

    try {
      const result = await userService.createUser(userData);

      if (result.success && result.user) {
        setSuccess(
          `User ${result.user.firstName} ${result.user.lastName} created successfully!`
        );
        setResetForm(true);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess("");
          setResetForm(false);
        }, 5000);
      } else {
        setError(result.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Create user error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    createUser,
    loading,
    error,
    success,
    resetForm,
    clearMessages,
  };
};
