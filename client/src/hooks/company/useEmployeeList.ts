import { useState, useCallback } from "react";
import { companyService } from "../services/companies";
import { userService } from "../services/users";
import type { CompanyEmployee, EmployeesPagination } from "../types/companies";

export function useEmployee() {
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesPagination, setEmployeesPagination] =
    useState<EmployeesPagination | null>(null);
  const [employeesSearchTerm, setEmployeesSearchTerm] = useState("");
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEmployees = useCallback(
    async (
      companyId: string,
      page = 1,
      search = "",
      roleFilter = ""
    ): Promise<void> => {
      setEmployeesLoading(true);
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
        const pagination: EmployeesPagination = response.data
          .userPagination || {
          currentPage: page,
          totalPages: 1,
          totalUsers: companyUsers.length,
          hasNextPage: false,
          hasPrevPage: false,
          usersPerPage: 10,
        };

        setEmployees(companyUsers);
        setEmployeesPagination(pagination);
        setEmployeesSearchTerm(search);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch employees"
        );
        throw err;
      } finally {
        setEmployeesLoading(false);
      }
    },
    []
  );

  const searchEmployees = useCallback(
    (companyId: string, searchTerm: string, roleFilter = "") => {
      setEmployeesSearchTerm(searchTerm);
      fetchEmployees(companyId, 1, searchTerm, roleFilter);
    },
    [fetchEmployees]
  );

  const clearEmployeesSearch = useCallback(
    (companyId: string) => {
      setEmployeesSearchTerm("");
      fetchEmployees(companyId, 1, "");
    },
    [fetchEmployees]
  );

  const deleteEmployee = useCallback(
    async (userId: string, companyId: string): Promise<boolean> => {
      setDeletingEmployeeId(userId);
      setError("");
      setSuccess("");

      try {
        const result = await userService.deleteUser(userId);
        setSuccess(result.message || "Employee deleted successfully");

        // Refresh the employees list
        await fetchEmployees(
          companyId,
          employeesPagination?.currentPage || 1,
          employeesSearchTerm
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete employee"
        );
        throw err;
      } finally {
        setDeletingEmployeeId(null);
      }
    },
    [fetchEmployees, employeesPagination, employeesSearchTerm]
  );

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    employees,
    employeesLoading,
    employeesPagination,
    employeesSearchTerm,
    deletingEmployeeId,
    error,
    success,
    fetchEmployees,
    searchEmployees,
    clearEmployeesSearch,
    deleteEmployee,
    clearMessages,
  };
}
