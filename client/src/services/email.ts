import axios, { AxiosError } from "axios";
import type {
  CreateEmailData,
  CreateEmailResponse,
  ScheduledEmail,
  EmailsResponse,
  TemplatesResponse,
  EmailActionResponse,
  ApiErrorResponse,
} from "../types/emails";

const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // Essential for session cookies
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle session expiration
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const emailService = {
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