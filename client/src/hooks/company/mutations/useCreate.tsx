import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";
import type { CreateCompanyData } from "../../../types/companies";

export function useCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createCompany = useCallback(async (data: CreateCompanyData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await companyService.createCompany(data);
      setSuccess("Company created successfully");
    } catch (err) {
      console.error("Error creating company:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    createCompany,
    loading,
    error,
    success,
    clearMessages,
  };
}
