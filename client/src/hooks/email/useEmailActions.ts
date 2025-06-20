import { useState, useCallback } from "react";
import { emailService } from "../services/email";

export function useEmailActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelEmail = useCallback(async (emailId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await emailService.cancelEmail(emailId);

      if (result.success) {
        return true;
      } else {
        setError(result.error || "Failed to cancel email");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel email");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const retryEmail = useCallback(async (emailId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await emailService.retryEmail(emailId);

      if (result.success) {
        return true;
      } else {
        setError(result.error || "Failed to retry email");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry email");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    cancelEmail,
    retryEmail,
    clearError,
    setError,
  };
}
