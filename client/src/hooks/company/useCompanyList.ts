import { useState, useCallback } from "react";
import { companyService } from "../services/companies";
import type { Company, CompaniesPagination } from "../types/companies";

export function useCompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesPagination, setCompaniesPagination] =
    useState<CompaniesPagination | null>(null);
  const [companiesSearchTerm, setCompaniesSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCompanies = useCallback(
    async (page = 1, search = ""): Promise<void> => {
      setCompaniesLoading(true);
      setError("");

      try {
        const response = await companyService.getCompanies({
          page,
          limit: 6,
          search: search || undefined,
        });

        setCompanies(response.data.companies);
        setCompaniesPagination(response.data.pagination);
        setCompaniesSearchTerm(search);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch companies"
        );
        throw err;
      } finally {
        setCompaniesLoading(false);
      }
    },
    []
  );

  const searchCompanies = useCallback(
    (searchTerm: string) => {
      setCompaniesSearchTerm(searchTerm);
      fetchCompanies(1, searchTerm);
    },
    [fetchCompanies]
  );

  const clearCompaniesSearch = useCallback(() => {
    setCompaniesSearchTerm("");
    fetchCompanies(1, "");
  }, []);

  const refreshCompanies = useCallback(() => {
    fetchCompanies(companiesPagination?.currentPage || 1, companiesSearchTerm);
  }, [fetchCompanies, companiesPagination, companiesSearchTerm]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    companies,
    companiesLoading,
    companiesPagination,
    companiesSearchTerm,
    error,
    success,
    fetchCompanies,
    searchCompanies,
    clearCompaniesSearch,
    refreshCompanies,
    clearMessages,
  };
}
