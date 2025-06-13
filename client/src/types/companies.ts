import type { User } from "./user";

// API Error response interface
export interface ApiErrorResponse {
  success: boolean;
  message: string;
}

// Pagination interfaces
export interface CompaniesPagination {
  currentPage: number;
  totalPages: number;
  totalCompanies: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  companiesPerPage: number;
}

export interface EmployeesPagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  usersPerPage: number;
}

// Company interfaces
export interface Company {
  id: string;
  name: string;
  email: string;
  logo?: string;
  website: string;
  createdAt: string;
  updatedAt: string;
  users?: CompanyEmployee[];
}

export interface CompanyEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "employee";
  isActive: boolean;
  avatar?: string;
  companyId?: string;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  website: string;
  logo?: File;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  website?: string;
  logo?: File;
}

// Context Type
export interface CompanyContextType {
  companies: Company[];
  companiesLoading: boolean;
  companiesPagination: CompaniesPagination | null;
  companiesSearchTerm: string;
  currentCompany: Company | null;
  currentCompanyLoading: boolean;
  employees: CompanyEmployee[];
  employeesLoading: boolean;
  employeesPagination: EmployeesPagination | null;
  employeesSearchTerm: string;
  deletingCompanyId: string | null;
  deletingEmployeeId: string | null;
  isExporting: boolean;
  isEditing: boolean;
  updating: boolean;
  error: string;
  success: string;

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

// API Response interfaces
export interface CompanyResponse {
  success: boolean;
  message: string;
  data: {
    company: Company;
    userPagination?: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      usersPerPage: number;
    };
  };
}

export interface CompaniesResponse {
  success: boolean;
  message: string;
  data: {
    companies: Company[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCompanies: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      companiesPerPage: number;
    };
  };
}

export interface CompanyDetailsProps {
  company: Company;
  companyId: string;
  loading: boolean;
  onUpdate?: (company: Company) => void;
  currentUser?: User;
}

export interface CreateCompanyFormProps {
  onSubmit: (data: CreateCompanyData) => Promise<void>;
  loading?: boolean;
  mode: "create";
  company?: never;
}

export interface EditCompanyFormProps {
  onSubmit: (data: UpdateCompanyData) => Promise<void>;
  loading?: boolean;
  mode: "edit";
  company: Company;
}

export interface CompanyCardProps {
  company: Company;
  userRole: "super_admin" | "manager" | "employee";
}

export interface EmployeeTableProps {
  companyId: string;
}

export interface CompanyListProps {
  userRole: "super_admin" | "manager" | "employee";
}
