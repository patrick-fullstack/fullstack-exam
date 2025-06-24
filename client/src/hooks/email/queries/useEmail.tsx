import { useState, useCallback } from "react";
import { emailService } from "../../../services/email";
import type { ScheduledEmail } from "../../../types/emails";

// Email list queries
export function useEmails() {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEmails: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadEmails = useCallback(async (page = 1, status?: string) => {
    setLoading(true);
    setError("");

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
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshEmails = useCallback(
    (status?: string) => {
      loadEmails(pagination.currentPage, status);
    },
    [loadEmails, pagination.currentPage]
  );

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    emails,
    loading,
    error,
    pagination,
    loadEmails,
    refreshEmails,
    clearError,
  };
}

// Single email query
export function useEmail() {
  const [currentEmail, setCurrentEmail] = useState<ScheduledEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getEmailById = useCallback(async (emailId: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await emailService.getEmailById(emailId);

      if (result.success && result.data) {
        setCurrentEmail(result.data);
        return true;
      } else {
        setError(result.error || "Failed to load email details");
        return false;
      }
    } catch (err) {
      console.error("Error fetching email:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentEmail = useCallback(() => {
    setCurrentEmail(null);
    setError("");
  }, []);

  return {
    currentEmail,
    loading,
    error,
    getEmailById,
    clearCurrentEmail,
    setCurrentEmail,
  };
}
