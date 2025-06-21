import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";
import { userService } from "../../../services/users";

export function useDelete() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deleteCompany = useCallback(async (companyId: string) => {
    setDeletingId(companyId);
    setError("");
    setSuccess("");

    try {
      const result = await companyService.deleteCompany(companyId);
      setSuccess(result.message || "Company deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting company:", err);
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
    deleteCompany,
    deletingId,
    error,
    success,
    clearMessages,
  };
}

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
