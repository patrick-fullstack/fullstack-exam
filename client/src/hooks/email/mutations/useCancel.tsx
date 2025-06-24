import { useState, useCallback } from "react";
import { emailService } from "../../../services/email";

// Cancel email mutation
export function useCancelEmail() {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cancelEmail = useCallback(async (emailId: string) => {
    setCancelingId(emailId);
    setError("");
    setSuccess("");

    try {
      const result = await emailService.cancelEmail(emailId);

      if (result.success) {
        setSuccess("Email cancelled successfully");
        return true;
      } else {
        setError(result.error || "Failed to cancel email");
        return false;
      }
    } catch (err) {
      console.error("Error cancelling email:", err);
      return false;
    } finally {
      setCancelingId(null);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    cancelEmail,
    cancelingId,
    error,
    success,
    clearMessages,
  };
}
