import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { companyService } from "../services/companies";
import { userService } from "../services/users";
import type {
  Company,
  CompanyEmployee,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyContextType,
  CompaniesPagination,
  EmployeesPagination,
} from "../types/companies";

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const initialState = {
  companies: [] as Company[],
  companiesLoading: false,
  companiesPagination: null as CompaniesPagination | null,
  companiesSearchTerm: "",
  currentCompany: null as Company | null,
  currentCompanyLoading: false,
  employees: [] as CompanyEmployee[],
  employeesLoading: false,
  employeesPagination: null as EmployeesPagination | null,
  employeesSearchTerm: "",
  deletingCompanyId: null as string | null,
  deletingEmployeeId: null as string | null,
  isExporting: false,
  isEditing: false,
  updating: false,
  error: "",
  success: "",
};

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updates: Partial<typeof initialState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchCompanies = useCallback(
    async (page = 1, search = "") => {
      updateState({ companiesLoading: true, error: "" });

      const response = await companyService.getCompanies({
        page,
        limit: 6,
        search: search || undefined,
      });

      updateState({
        companies: response.data.companies,
        companiesPagination: response.data.pagination,
        companiesSearchTerm: search,
        companiesLoading: false,
      });
    },
    [updateState]
  );

  const searchCompanies = useCallback(
    (searchTerm: string) => {
      updateState({ companiesSearchTerm: searchTerm });
      fetchCompanies(1, searchTerm);
    },
    [fetchCompanies, updateState]
  );

  const clearCompaniesSearch = useCallback(() => {
    updateState({ companiesSearchTerm: "" });
    fetchCompanies(1, "");
  }, [fetchCompanies, updateState]);

  const deleteCompany = useCallback(
    async (companyId: string): Promise<boolean> => {
      updateState({ deletingCompanyId: companyId, error: "", success: "" });

      const result = await companyService.deleteCompany(companyId);
      updateState({
        success: result.message || "Company deleted successfully",
        deletingCompanyId: null,
      });

      await fetchCompanies(
        state.companiesPagination?.currentPage || 1,
        state.companiesSearchTerm
      );
      return true;
    },
    [fetchCompanies, updateState, state.companiesPagination, state.companiesSearchTerm]
  );

  const createCompany = useCallback(
    async (data: CreateCompanyData): Promise<void> => {
      updateState({ error: "", success: "" });

      await companyService.createCompany(data);
      updateState({ success: "Company created successfully" });
      await fetchCompanies(1, "");
    },
    [fetchCompanies, updateState]
  );

  const fetchCompany = useCallback(
    async (companyId: string) => {
      updateState({ currentCompanyLoading: true, error: "" });

      const response = await companyService.getCompanyById(companyId);
      updateState({
        currentCompany: response.data.company,
        currentCompanyLoading: false,
      });
    },
    [updateState]
  );

  const updateCompany = useCallback(
    async (companyId: string, data: UpdateCompanyData): Promise<boolean> => {
      updateState({ updating: true, error: "", success: "" });

      const result = await companyService.updateCompany(companyId, data);
      updateState({
        success: result.message || "Company updated successfully",
        currentCompany: result.data.company,
        updating: false,
        isEditing: false,
      });
      return true;
    },
    [updateState]
  );

  const exportCompanyCSV = useCallback(
    async (companyId: string) => {
      updateState({ isExporting: true, error: "", success: "" });

      await companyService.exportCompanyToCSV(companyId);
      updateState({
        success: "Company data exported successfully",
        isExporting: false,
      });
    },
    [updateState]
  );

  const clearCurrentCompany = useCallback(() => {
    updateState({
      currentCompany: null,
      employees: [],
      employeesSearchTerm: "",
      isEditing: false,
    });
  }, [updateState]);

  const setCurrentCompany = useCallback(
    (company: Company | null) => {
      updateState({ currentCompany: company });
    },
    [updateState]
  );

  const fetchEmployees = useCallback(
    async (companyId: string, page = 1, search = "", roleFilter = "") => {
      updateState({ employeesLoading: true, error: "" });

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
      const pagination: EmployeesPagination = response.data.userPagination || {
        currentPage: page,
        totalPages: 1,
        totalUsers: companyUsers.length,
        hasNextPage: false,
        hasPrevPage: false,
        usersPerPage: 10,
      };

      updateState({
        employees: companyUsers,
        employeesPagination: pagination,
        employeesSearchTerm: search,
        employeesLoading: false,
      });
    },
    [updateState]
  );

  const searchEmployees = useCallback(
    (searchTerm: string, roleFilter = "") => {
      updateState({ employeesSearchTerm: searchTerm });
      if (state.currentCompany) {
        fetchEmployees(state.currentCompany.id, 1, searchTerm, roleFilter);
      }
    },
    [fetchEmployees, updateState, state.currentCompany]
  );

  const clearEmployeesSearch = useCallback(() => {
    updateState({ employeesSearchTerm: "" });
    if (state.currentCompany) {
      fetchEmployees(state.currentCompany.id, 1, "");
    }
  }, [fetchEmployees, updateState, state.currentCompany]);

  const deleteEmployee = useCallback(
    async (userId: string): Promise<boolean> => {
      updateState({ deletingEmployeeId: userId, error: "", success: "" });

      const result = await userService.deleteUser(userId);
      updateState({
        success: result.message || "Employee deleted successfully",
        deletingEmployeeId: null,
      });

      if (state.currentCompany) {
        await fetchEmployees(
          state.currentCompany.id,
          state.employeesPagination?.currentPage || 1,
          state.employeesSearchTerm
        );
      }
      return true;
    },
    [fetchEmployees, updateState, state.currentCompany, state.employeesPagination, state.employeesSearchTerm]
  );

  const setError = useCallback(
    (error: string) => updateState({ error }),
    [updateState]
  );

  const setSuccess = useCallback(
    (success: string) => updateState({ success }),
    [updateState]
  );

  const clearMessages = useCallback(
    () => updateState({ error: "", success: "" }),
    [updateState]
  );

  const setIsEditing = useCallback(
    (editing: boolean) => updateState({ isEditing: editing }),
    [updateState]
  );

  const contextValue: CompanyContextType = {
    ...state,
    fetchCompanies,
    searchCompanies,
    clearCompaniesSearch,
    deleteCompany,
    createCompany,
    fetchCompany,
    updateCompany,
    exportCompanyCSV,
    clearCurrentCompany,
    setCurrentCompany,
    fetchEmployees,
    searchEmployees,
    clearEmployeesSearch,
    deleteEmployee,
    setError,
    setSuccess,
    clearMessages,
    setIsEditing,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}