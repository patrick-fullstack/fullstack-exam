import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// API Error response interface
interface ApiErrorResponse {
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
interface CompanyResponse {
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

interface CompaniesResponse {
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

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      Cookies.remove("token");
    }
    return Promise.reject(error);
  }
);

export const companyService = {
  /**
   * Get all companies with pagination and search
   */
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CompaniesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const response = await api.get(`/company?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to fetch companies"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  /**
   * Get company by ID with employees
   */
  async getCompanyById(
    companyId: string,
    params?: {
      userPage?: number;
      userLimit?: number;
      userSearch?: string;
      userRole?: string;
      userStatus?: boolean;
    }
  ): Promise<CompanyResponse> {
    const queryParams = new URLSearchParams();

    if (params?.userPage)
      queryParams.append("userPage", params.userPage.toString());
    if (params?.userLimit)
      queryParams.append("userLimit", params.userLimit.toString());
    if (params?.userSearch) queryParams.append("userSearch", params.userSearch);
    if (params?.userRole) queryParams.append("userRole", params.userRole);
    if (params?.userStatus !== undefined)
      queryParams.append("userStatus", params.userStatus.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await api.get(`/company/${companyId}${query}`);
    return response.data;
  },

  /**
   * Create new company (Super Admin only)
   */
  async createCompany(
    companyData: CreateCompanyData
  ): Promise<CompanyResponse> {
    try {
      const formData = new FormData();
      formData.append("name", companyData.name);
      formData.append("email", companyData.email);
      formData.append("website", companyData.website);

      if (companyData.logo) {
        formData.append("logo", companyData.logo);
      }

      const response = await api.post("/company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to create company"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  /**
   * Update company
   */
  async updateCompany(
    companyId: string,
    companyData: UpdateCompanyData
  ): Promise<CompanyResponse> {
    try {
      const formData = new FormData();

      if (companyData.name !== undefined) {
        formData.append("name", companyData.name);
      }
      if (companyData.email !== undefined) {
        formData.append("email", companyData.email);
      }
      if (companyData.website !== undefined) {
        formData.append("website", companyData.website);
      }
      if (companyData.logo) {
        formData.append("logo", companyData.logo);
      }

      const response = await api.put(`/company/${companyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to update company"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  /**
   * Delete company (Super Admin only)
   */
  async deleteCompany(
    companyId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/company/${companyId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to delete company"
        );
      }
      throw new Error("Network error occurred");
    }
  },

  /**
   * Export company data to CSV
   */
  async exportCompanyToCSV(companyId: string): Promise<void> {
    const { data, headers } = await api.get(`/company/export/${companyId}`, {
      responseType: "blob",
      timeout: 30000,
    });

    const blob = new Blob([data], { type: "text/csv; charset=utf-8" });
    const filename =
      headers["content-disposition"]?.match(/filename="(.+)"/)?.[1] ||
      `company_export_${Date.now()}.csv`;

    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: filename,
    }).click();
  },
};
