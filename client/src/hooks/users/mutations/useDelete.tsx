import { useState, useCallback } from "react";
import { userService } from "../../../services/users";

export function useDeleteEmployee() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deleteEmployee = useCallback(async (userId: string) => {
    setDeletingId(userId);
    setError("");
    setSuccess("");

    try {
      const result = await userService.deleteUser(userId);
      setSuccess(result.message || "Employee deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete employee"
      );
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    deleteEmployee,
    deletingId,
    error,
    success,
    clearMessages,
  };
}

// Alternative name for user deletion (more generic)
export function useDeleteUser() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deleteUser = useCallback(async (userId: string) => {
    setDeletingId(userId);
    setError("");
    setSuccess("");

    try {
      const result = await userService.deleteUser(userId);
      setSuccess(result.message || "User deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err instanceof Error ? err.message : "Failed to delete user");
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    deleteUser,
    deletingId,
    error,
    success,
    clearMessages,
  };
}
