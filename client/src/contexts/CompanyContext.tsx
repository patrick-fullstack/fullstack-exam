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
} from "../types/companies";

interface CompanyContextType {
  // State
  companies: Company[];
  companiesLoading: boolean;
  companiesPagination: any;
  companiesSearchTerm: string;
  currentCompany: Company | null;
  currentCompanyLoading: boolean;
  employees: CompanyEmployee[];
  employeesLoading: boolean;
  employeesPagination: any;
  employeesSearchTerm: string;
  deletingCompanyId: string | null;
  deletingEmployeeId: string | null;
  isExporting: boolean;
  isEditing: boolean;
  updating: boolean;
  error: string;
  success: string;

  // Actions
  fetchCompanies: (page?: number, search?: string) => Promise<void>;
  searchCompanies: (searchTerm: string) => void;
  clearCompaniesSearch: () => void;
  deleteCompany: (companyId: string) => Promise<boolean>;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  fetchCompany: (companyId: string) => Promise<void>;
  updateCompany: (
    companyId: string,
    data: UpdateCompanyData
  ) => Promise<boolean>;
  exportCompanyCSV: (companyId: string) => Promise<void>;
  clearCurrentCompany: () => void;
  setCurrentCompany: (company: Company | null) => void;
  fetchEmployees: (
    companyId: string,
    page?: number,
    search?: string
  ) => Promise<void>;
  searchEmployees: (searchTerm: string) => void;
  clearEmployeesSearch: () => void;
  deleteEmployee: (userId: string) => Promise<boolean>;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  clearMessages: () => void;
  setIsEditing: (editing: boolean) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Fixed initial state - removed 'as const' which was causing type issues
const initialState = {
  companies: [] as Company[],
  companiesLoading: false,
  companiesPagination: null as any,
  companiesSearchTerm: "",
  currentCompany: null as Company | null,
  currentCompanyLoading: false,
  employees: [] as CompanyEmployee[],
  employeesLoading: false,
  employeesPagination: null as any,
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

  // Fixed updateState typing
  const updateState = useCallback((updates: Partial<typeof initialState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchCompanies = useCallback(
    async (page = 1, search = "") => {
      updateState({ companiesLoading: true, error: "" });
      try {
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
      } catch (error) {
        updateState({
          companiesLoading: false,
          error: "Failed to load companies",
        });
      }
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
      try {
        const result = await companyService.deleteCompany(companyId);
        if (result.success) {
          updateState({
            success: "Company deleted successfully",
            deletingCompanyId: null,
          });
          // Use current state values directly
          setState((currentState) => {
            fetchCompanies(
              currentState.companiesPagination?.currentPage || 1,
              currentState.companiesSearchTerm
            );
            return currentState;
          });
          return true;
        }
        updateState({
          error: result.message || "Failed to delete company",
          deletingCompanyId: null,
        });
        return false;
      } catch (error) {
        updateState({
          error: "Failed to delete company",
          deletingCompanyId: null,
        });
        return false;
      }
    },
    [fetchCompanies, updateState]
  );

  const createCompany = useCallback(
    async (data: CreateCompanyData): Promise<void> => {
      updateState({ error: "", success: "" });
      try {
        await companyService.createCompany(data);
        updateState({ success: "Company created successfully" });
        await fetchCompanies(1, "");
      } catch (error) {
        updateState({
          error:
            error instanceof Error ? error.message : "Failed to create company",
        });
      }
    },
    [fetchCompanies, updateState]
  );

  const fetchCompany = useCallback(
    async (companyId: string) => {
      updateState({ currentCompanyLoading: true, error: "" });
      try {
        const response = await companyService.getCompanyById(companyId);
        updateState({
          currentCompany: response.data.company,
          currentCompanyLoading: false,
        });
      } catch (error) {
        updateState({
          currentCompanyLoading: false,
          error: "Failed to load company details",
        });
      }
    },
    [updateState]
  );

  const updateCompany = useCallback(
    async (companyId: string, data: UpdateCompanyData): Promise<boolean> => {
      updateState({ updating: true, error: "", success: "" });
      try {
        const result = await companyService.updateCompany(companyId, data);
        if (result.success) {
          const updatedCompany = result.data?.company || result.data;
          updateState({
            success: "Company updated successfully",
            currentCompany: updatedCompany,
            updating: false,
            isEditing: false,
          });
          return true;
        }
        updateState({
          error: result.message || "Update failed",
          updating: false,
        });
        return false;
      } catch (error) {
        updateState({
          error: "Failed to update company",
          updating: false,
        });
        return false;
      }
    },
    [updateState]
  );

  const exportCompanyCSV = useCallback(
    async (companyId: string) => {
      updateState({ isExporting: true, error: "", success: "" });
      try {
        await companyService.exportCompanyToCSV(companyId);
        updateState({
          success: "Company data exported successfully",
          isExporting: false,
        });
      } catch (error) {
        updateState({
          error:
            error instanceof Error
              ? error.message
              : "Failed to export company data",
          isExporting: false,
        });
      }
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
    async (companyId: string, page = 1, search = "") => {
      updateState({ employeesLoading: true, error: "" });
      try {
        const response = await companyService.getCompanyById(companyId, {
          userPage: page,
          userLimit: 10,
          userSearch: search || undefined,
        });

        if (response.success && response.data) {
          const companyUsers = response.data.company.users || [];
          const pagination = response.data.userPagination || {
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
        } else {
          updateState({
            employeesLoading: false,
            error: "Failed to load employees",
          });
        }
      } catch (error) {
        updateState({
          employeesLoading: false,
          error: "Failed to load employees",
        });
      }
    },
    [updateState]
  );

  const searchEmployees = useCallback(
    (searchTerm: string) => {
      updateState({ employeesSearchTerm: searchTerm });
      setState((currentState) => {
        if (currentState.currentCompany) {
          fetchEmployees(currentState.currentCompany.id, 1, searchTerm);
        }
        return currentState;
      });
    },
    [fetchEmployees, updateState]
  );

  const clearEmployeesSearch = useCallback(() => {
    updateState({ employeesSearchTerm: "" });
    setState((currentState) => {
      if (currentState.currentCompany) {
        fetchEmployees(currentState.currentCompany.id, 1, "");
      }
      return currentState;
    });
  }, [fetchEmployees, updateState]);

  const deleteEmployee = useCallback(
    async (userId: string): Promise<boolean> => {
      updateState({ deletingEmployeeId: userId, error: "", success: "" });
      try {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          updateState({
            success: "Employee deleted successfully",
            deletingEmployeeId: null,
          });
          // Use current state values directly
          setState((currentState) => {
            if (currentState.currentCompany) {
              fetchEmployees(
                currentState.currentCompany.id,
                currentState.employeesPagination?.currentPage || 1,
                currentState.employeesSearchTerm
              );
            }
            return currentState;
          });
          return true;
        }
        updateState({
          error: result.error || "Failed to delete employee",
          deletingEmployeeId: null,
        });
        return false;
      } catch (error) {
        updateState({
          error: "Failed to delete employee",
          deletingEmployeeId: null,
        });
        return false;
      }
    },
    [fetchEmployees, updateState]
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
