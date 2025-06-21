import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";

export function useExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const exportCompanyCSV = useCallback(async (companyId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await companyService.exportCompanyToCSV(companyId);
      setSuccess("Company data exported successfully");
    } catch (err) {
      console.error("Error exporting company data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    exportCompanyCSV,
    loading,
    error,
    success,
    clearMessages,
  };
}
