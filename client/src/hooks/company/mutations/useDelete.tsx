import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";

export function useDeleteCompany() {
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
      setError(err instanceof Error ? err.message : "Failed to delete company");
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
