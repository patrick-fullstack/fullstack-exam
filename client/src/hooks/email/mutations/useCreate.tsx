import { useState, useCallback } from "react";
import { emailService } from "../../../services/email";
import type { CreateEmailData } from "../../../types/emails";

export function useCreateEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createEmail = useCallback(async (emailData: CreateEmailData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await emailService.createEmail(emailData);

      if (result.success) {
        setSuccess("Email processed successfully!");
        return true;
      } else {
        setError(result.error || "Failed to create email");
        return false;
      }
    } catch (err) {
      console.error("Error creating email:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    createEmail,
    loading,
    error,
    success,
    clearMessages,
  };
}
