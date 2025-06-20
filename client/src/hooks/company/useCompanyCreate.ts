import { useState, useCallback } from "react";
import { companyService } from "../services/companies";
import type { CreateCompanyData } from "../types/companies";

export function useCompanyCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createCompany = useCallback(
    async (data: CreateCompanyData, onSuccess?: () => void): Promise<void> => {
      setIsCreating(true);
      setError("");
      setSuccess("");

      try {
        await companyService.createCompany(data);
        setSuccess("Company created successfully");
        if (onSuccess) onSuccess(); // Call this to refresh list
      } catch (err) {
        console.log(err);
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    createCompany,
    isCreating,
    error,
    success,
    clearMessages,
  };
}
