import type { User } from "./user";

// API Error response interface
export interface ApiErrorResponse {
  success: boolean;
  message: string;
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
  loading?: boolean;
  onUpdate?: (updatedCompany: Company) => void;
  currentUser?: User;
}

export interface CreateCompanyFormProps {
  onSubmit: (data: CreateCompanyData) => Promise<void>;
  loading?: boolean;
  error?: string;
  mode: "create";
  company?: never; // Not allowed in create mode
}

export interface EditCompanyFormProps {
  onSubmit: (data: UpdateCompanyData) => Promise<void>;
  loading?: boolean;
  error?: string;
  mode: "edit";
  company: Company; // Required in edit mode
}

export interface CompanyCardProps {
  company: Company;
  onDelete?: (companyId: string) => void;
  isDeleting?: boolean;
  userRole: "super_admin" | "manager" | "employee";
}

export interface EmployeeTableProps {
  companyId: string;
  currentUserRole: "super_admin" | "manager" | "employee";
  currentUserId?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export interface CompanyListProps {
  userRole: "super_admin" | "manager" | "employee";
  onError?: (error: string) => void;
}
