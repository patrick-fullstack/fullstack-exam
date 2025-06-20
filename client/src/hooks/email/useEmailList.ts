import { useState, useCallback } from "react";
import { emailService } from "../services/email";
import type { ScheduledEmail } from "../types/emails";

interface EmailPagination {
  currentPage: number;
  totalPages: number;
  totalEmails: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useEmailList() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<EmailPagination>({
    currentPage: 1,
    totalPages: 1,
    totalEmails: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadEmails = useCallback(async (page: number = 1, status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await emailService.getEmails({
        page,
        limit: 10,
        status: status || undefined,
      });

      if (result.success && result.data) {
        setEmails(result.data.emails);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to load emails");
        setEmails([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emails");
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshEmails = useCallback(
    async (status?: string) => {
      await loadEmails(pagination.currentPage, status);
    },
    [loadEmails, pagination.currentPage]
  );

  const goToPage = useCallback(
    async (page: number, status?: string) => {
      await loadEmails(page, status);
    },
    [loadEmails]
  );

  const clearEmails = useCallback(() => {
    setEmails([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalEmails: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  }, []);

  return {
    emails,
    loading,
    error,
    pagination,
    loadEmails,
    refreshEmails,
    goToPage,
    clearEmails,
    clearError,
    setError,
  };
}
