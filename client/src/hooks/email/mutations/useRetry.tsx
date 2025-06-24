import { useState, useCallback } from "react";
import { emailService } from "../../../services/email";

// Retry email mutation
export function useRetryEmail() {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const retryEmail = useCallback(async (emailId: string) => {
    setRetryingId(emailId);
    setError("");
    setSuccess("");

    try {
      const result = await emailService.retryEmail(emailId);

      if (result.success) {
        setSuccess("Email retry initiated successfully");
        return true;
      } else {
        setError(result.error || "Failed to retry email");
        return false;
      }
    } catch (err) {
      console.error("Error retrying email:", err);
      return false;
    } finally {
      setRetryingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    retryEmail,
    retryingId,
    error,
    success,
    clearMessages,
  };
}
