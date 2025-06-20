import { useState, useCallback } from "react";
import { emailService } from "../services/email";
import type { CreateEmailData } from "../types/emails";

export function useEmailCreate() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const createEmail = useCallback(
    async (emailData: CreateEmailData): Promise<boolean> => {
      setCreating(true);
      setError(null);
      setSuccess(null);

      try {
        const result = await emailService.createEmail(emailData);

        if (result.success) {
          setSuccess("Email scheduled successfully");
          return true;
        } else {
          setError(result.error || "Failed to create email");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create email");
        return false;
      } finally {
        setCreating(false);
      }
    },
    []
  );

  return {
    creating,
    error,
    success,
    createEmail,
    clearError,
    clearSuccess,
    clearMessages,
    setError,
    setSuccess,
  };
}
