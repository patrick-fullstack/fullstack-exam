import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";
import type { UpdateCompanyData } from "../../../types/companies";

export function useUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateCompany = useCallback(
    async (companyId: string, data: UpdateCompanyData) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const result = await companyService.updateCompany(companyId, data);
        setSuccess(result.message || "Company updated successfully");
        return result.data.company;
      } catch (err) {
        console.error("Error updating company:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    updateCompany,
    loading,
    error,
    success,
    clearMessages,
  };
}
