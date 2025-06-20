import { useState, useCallback } from "react";
import { emailService } from "../services/email";
import type { ScheduledEmail } from "../types/emails";

export function useEmailDetails() {
  const [currentEmail, setCurrentEmail] = useState<ScheduledEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getEmailById = useCallback(
    async (emailId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

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
        setError(
          err instanceof Error ? err.message : "Failed to load email details"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearCurrentEmail = useCallback(() => {
    setCurrentEmail(null);
    setError(null);
  }, []);

  const updateCurrentEmail = useCallback((email: ScheduledEmail | null) => {
    setCurrentEmail(email);
  }, []);

  return {
    currentEmail,
    loading,
    error,
    getEmailById,
    setCurrentEmail: updateCurrentEmail,
    clearCurrentEmail,
    clearError,
    setError,
  };
}
