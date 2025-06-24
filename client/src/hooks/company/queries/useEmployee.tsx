import { useState, useCallback } from "react";
import { companyService } from "../../../services/companies";
import type {
  CompanyEmployee,
  EmployeesPagination,
} from "../../../types/companies";

export function useEmployees() {
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<EmployeesPagination | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const fetchEmployees = useCallback(
    async (companyId: string, page = 1, search = "", roleFilter = "") => {
      setLoading(true);
      setError("");

      try {
        const params: {
          userPage: number;
          userLimit: number;
          userSearch?: string;
          userRole?: string;
        } = {
          userPage: page,
          userLimit: 10,
        };

        if (search) params.userSearch = search;
        if (roleFilter) params.userRole = roleFilter;

        const response = await companyService.getCompanyById(companyId, params);

        const companyUsers = response.data.company.users || [];
        const paginationData: EmployeesPagination = response.data
          .userPagination || {
          currentPage: page,
          totalPages: 1,
          totalUsers: companyUsers.length,
          hasNextPage: false,
          hasPrevPage: false,
          usersPerPage: 10,
        };

        setEmployees(companyUsers);
        setPagination(paginationData);
        setSearchTerm(search);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchEmployees = useCallback(
    (term: string, companyId: string, roleFilter = "") => {
      setSearchTerm(term);
      fetchEmployees(companyId, 1, term, roleFilter);
    },
    [fetchEmployees]
  );

  const clearEmployeesSearch = useCallback(
    (companyId: string) => {
      setSearchTerm("");
      fetchEmployees(companyId, 1, "");
    },
    [fetchEmployees]
  );

  return {
    employees,
    loading,
    pagination,
    searchTerm,
    error,
    fetchEmployees,
    searchEmployees,
    clearEmployeesSearch,
  };
}
