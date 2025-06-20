import { useState, useCallback } from "react";
import { companyService } from "../services/companies";

export function useCompanyDelete() {
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deleteCompany = useCallback(
    async (companyId: string): Promise<boolean> => {
      setDeletingCompanyId(companyId);
      setError("");
      setSuccess("");

      try {
        const result = await companyService.deleteCompany(companyId);
        setSuccess(result.message || "Company deleted successfully");
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete company"
        );
        throw err;
      } finally {
        setDeletingCompanyId(null);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const isDeleting = useCallback(
    (companyId: string) => deletingCompanyId === companyId,
    [deletingCompanyId]
  );

  return {
    deleteCompany,
    deletingCompanyId,
    isDeleting,
    error,
    success,
    clearMessages,
  };
}
