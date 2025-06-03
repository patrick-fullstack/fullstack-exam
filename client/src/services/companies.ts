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
  timeout: 10000,
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
      const response = await api.get("/company", { params });
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
  async getCompanyById(companyId: string): Promise<CompanyResponse> {
    try {
      const response = await api.get(`/company/${companyId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to fetch company"
        );
      }
      throw new Error("Network error occurred");
    }
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
};
