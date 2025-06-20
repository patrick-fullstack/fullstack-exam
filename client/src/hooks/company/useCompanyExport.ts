import { useState, useCallback } from "react";
import { companyService } from "../services/companies";

export function useCompanyExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const exportCompanyCSV = useCallback(
    async (companyId: string): Promise<void> => {
      setIsExporting(true);
      setError("");
      setSuccess("");

      try {
        await companyService.exportCompanyToCSV(companyId);
        setSuccess("Company data exported successfully");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to export company data"
        );
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    exportCompanyCSV,
    isExporting,
    error,
    success,
    clearMessages,
  };
}
