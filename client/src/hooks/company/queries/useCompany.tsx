import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";
import type { Company, CompaniesPagination } from "../../../types/companies";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<CompaniesPagination | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const fetchCompanies = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await companyService.getCompanies({
        page,
        limit: 6,
        search: search || undefined,
      });

      setCompanies(response.data.companies);
      setPagination(response.data.pagination);
      setSearchTerm(search);
    } catch (err) {
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCompanies = useCallback(
    (term: string) => {
      setSearchTerm(term);
      fetchCompanies(1, term);
    },
    [fetchCompanies]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    fetchCompanies(1, "");
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    pagination,
    searchTerm,
    error,
    fetchCompanies,
    searchCompanies,
    clearSearch,
  };
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCompany = useCallback(async (companyId: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await companyService.getCompanyById(companyId);
      setCompany(response.data.company);
    } catch (err) {
      console.error("Error fetching company:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCompany = useCallback(() => {
    setCompany(null);
    setError("");
  }, []);

  return {
    company,
    loading,
    error,
    fetchCompany,
    clearCompany,
    setCompany,
  };
}
