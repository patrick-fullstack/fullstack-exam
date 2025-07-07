import { useState, useEffect, useRef } from "react";
import { companyService } from "../../../services/companies";
import { useAuth } from "../../../contexts/AuthContext";
import type { Company } from "../../../types/companies";

export const useCompanies = () => {
  const { isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasFetched || fetchingRef.current) {
      return;
    }

    const fetchCompanies = async () => {
      if (fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError("");

      try {
        const response = await companyService.getCompanies({
          page: 1,
          limit: 100,
        });

        if (response.success) {
          setCompanies(response.data.companies || []);
        } else {
          setError("Failed to load companies");
        }
      } catch {
        setError("Failed to load companies");
      } finally {
        setLoading(false);
        setHasFetched(true);
        fetchingRef.current = false;
      }
    };

    fetchCompanies();
  }, [isAuthenticated, hasFetched]); 

  useEffect(() => {
    if (!isAuthenticated) {
      setCompanies([]);
      setHasFetched(false);
      setError("");
    }
  }, [isAuthenticated]);

  return {
    companies,
    loading,
    error,
  };
};