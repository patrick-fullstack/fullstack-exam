import { useState, useCallback } from "react";
import { companyService } from "../services/companies";
import type { Company, UpdateCompanyData } from "../types/companies";

export function useCompanyUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateCompany = useCallback(
    async (
      companyId: string,
      data: UpdateCompanyData
    ): Promise<{ success: boolean; company?: Company }> => {
      setUpdating(true);
      setError("");
      setSuccess("");

      try {
        const result = await companyService.updateCompany(companyId, data);
        setSuccess(result.message || "Company updated successfully");

        return {
          success: true,
          company: result.data.company,
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update company"
        );
        throw err;
      } finally {
        setUpdating(false);
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
    updating,
    error,
    success,
    clearMessages,
  };
}
