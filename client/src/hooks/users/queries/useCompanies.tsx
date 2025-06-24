import { useState, useEffect } from "react";
import { companyService } from "../../../services/companies";
import type { Company } from "../../../types/companies";

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await companyService.getCompanies({
          page: 1,
          limit: 100, // Get all companies
        });

        if (response.success) {
          setCompanies(response.data.companies || []);
        } else {
          setError("Failed to load companies");
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
  };
};
