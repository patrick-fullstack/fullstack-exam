import { useState, useCallback } from "react";
import { companyService } from "../services/companies";
import type { Company } from "../types/companies";
import type { User } from "../types/users";

export function useCompanyDetails() {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [currentCompanyLoading, setCurrentCompanyLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCompany = useCallback(
    async (companyId: string, user?: User | null): Promise<void> => {
      setCurrentCompanyLoading(true);
      setError("");

      // Role-based access validation
      if (user) {
        // Employee can only view their own company
        if (user.role === "employee" && user.companyId !== companyId) {
          setError("Access denied. You can only view your own company.");
          setCurrentCompanyLoading(false);
          return;
        }

        // Manager can only view their own company (optional, depends on your requirements)
        if (user.role === "manager" && user.companyId !== companyId) {
          setError("Access denied. Managers can only view their own company.");
          setCurrentCompanyLoading(false);
          return;
        }

        // Super admin can view any company (no restrictions)
      }

      try {
        const response = await companyService.getCompanyById(companyId);
        setCurrentCompany(response.data.company);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch company"
        );
      } finally {
        setCurrentCompanyLoading(false);
      }
    },
    []
  );

  // Rest of the hook remains the same
  const clearCurrentCompany = useCallback(() => {
    setCurrentCompany(null);
    setIsEditing(false);
    setError("");
    setSuccess("");
  }, []);

  const setCurrentCompanyData = useCallback((company: Company | null) => {
    setCurrentCompany(company);
  }, []);

  const toggleEditing = useCallback((editing: boolean) => {
    setIsEditing(editing);
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    currentCompany,
    currentCompanyLoading,
    isEditing,
    error,
    success,
    fetchCompany,
    clearCurrentCompany,
    setCurrentCompany: setCurrentCompanyData,
    setIsEditing: toggleEditing,
    clearMessages,
    setError,
  };
}
