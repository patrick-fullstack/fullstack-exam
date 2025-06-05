import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// Email interfaces
export interface CreateEmailData {
  fromName: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  template: string;
  sendNow: boolean;
  scheduledFor?: string;
}

export interface ScheduledEmail {
  _id: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  template: string;
  sendNow: boolean;
  scheduledFor?: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  companyId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
}

// API Response interfaces
interface EmailsResponse {
  success: boolean;
  message: string;
  data: {
    emails: ScheduledEmail[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEmails: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

interface CreateEmailResponse {
  success: boolean;
  message: string;
  data: {
    email: ScheduledEmail;
  };
}

interface TemplatesResponse {
  success: boolean;
  message: string;
  data: {
    templates: EmailTemplate[];
  };
}

interface EmailActionResponse {
  success: boolean;
  message: string;
  data?: {
    email: ScheduledEmail;
  };
}

interface ApiErrorResponse {
  success: false;
  message: string;
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

export const emailService = {
  /**
   * Create a scheduled email
   */
  async createEmail(emailData: CreateEmailData) {
    try {
      const response = await api.post<CreateEmailResponse>(
        "/emails",
        emailData
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.email,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to create email",
      };
    } catch (error) {
      console.error("Create email error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to create email",
        };
      }

      return {
        success: false,
        error: "Failed to create email",
      };
    }
  },

  /**
   * Get all scheduled emails with pagination and filtering
   */
  async getEmails(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data?: {
      emails: ScheduledEmail[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalEmails: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        emailsPerPage: number;
      };
    };
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);

      const response = await api.get<EmailsResponse>(
        `/emails?${queryParams.toString()}`
      );

      if (response.data.success) {
        return {
          success: true,
          data: {
            emails: response.data.data.emails,
            pagination: {
              ...response.data.data.pagination,
              emailsPerPage: response.data.data.pagination.limit || 10,
            },
          },
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch emails",
      };
    } catch (error) {
      console.error("Get emails error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to fetch emails",
        };
      }

      return {
        success: false,
        error: "Failed to fetch emails",
      };
    }
  },

  /**
   * Get email templates
   */
  async getTemplates() {
    try {
      const response = await api.get<TemplatesResponse>("/emails/templates");

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.templates,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch templates",
      };
    } catch (error) {
      console.error("Get templates error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to fetch templates",
        };
      }

      return {
        success: false,
        error: "Failed to fetch templates",
      };
    }
  },

  /**
   * Cancel scheduled email
   */
  async cancelEmail(emailId: string) {
    try {
      const response = await api.put<EmailActionResponse>(
        `/emails/${emailId}/cancel`
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data?.email,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to cancel email",
      };
    } catch (error) {
      console.error("Cancel email error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to cancel email",
        };
      }

      return {
        success: false,
        error: "Failed to cancel email",
      };
    }
  },

  /**
   * Retry failed email
   */
  async retryEmail(emailId: string) {
    try {
      const response = await api.put<EmailActionResponse>(
        `/emails/${emailId}/retry`
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data?.email,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to retry email",
      };
    } catch (error) {
      console.error("Retry email error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to retry email",
        };
      }

      return {
        success: false,
        error: "Failed to retry email",
      };
    }
  },

  /**
   * Get email by ID
   */
  async getEmailById(emailId: string) {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { email: ScheduledEmail };
      }>(`/emails/${emailId}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.email,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to fetch email",
      };
    } catch (error) {
      console.error("Get email by ID error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to fetch email",
        };
      }

      return {
        success: false,
        error: "Failed to fetch email",
      };
    }
  },

  /**
   * Delete email
   */
  async deleteEmail(emailId: string) {
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
      }>(`/emails/${emailId}`);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }

      return {
        success: false,
        error: response.data.message || "Failed to delete email",
      };
    } catch (error) {
      console.error("Delete email error:", error);

      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        return {
          success: false,
          error: apiError.message || "Failed to delete email",
        };
      }

      return {
        success: false,
        error: "Failed to delete email",
      };
    }
  },
};
