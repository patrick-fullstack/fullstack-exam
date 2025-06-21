import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { emailService } from "../../services/email";
import { useCreateEmail } from "../../hooks/email/mutations/useCreate";
import type { CreateEmailData } from "../../types/emails";

interface EmailTemplate {
  id: string;
  name: string;
}

interface EmailFormProps {
  onSuccess?: () => void;
  resetForm?: boolean;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  onSuccess,
  resetForm = false,
}) => {
  const { createEmail, loading, error, clearMessages } = useCreateEmail();

  // Memoize the initial form state to prevent unnecessary re-renders
  const initialFormState: CreateEmailData = useMemo(
    () => ({
      fromName: "",
      fromEmail: "",
      toName: "",
      toEmail: "",
      subject: "",
      message: "",
      template: "default",
      sendNow: true,
      scheduledFor: "",
    }),
    []
  );

  const [formData, setFormData] = useState<CreateEmailData>(initialFormState);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Partial<CreateEmailData>
  >({});
  const [templateLoading, setTemplateLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTimeForServer = (
    dateTimeLocal: string | undefined
  ): string | undefined => {
    if (!dateTimeLocal) return undefined;
    const localDate = new Date(dateTimeLocal);
    return localDate.toISOString();
  };

  const handleReset = useCallback(() => {
    setFormData(initialFormState);
    setValidationErrors({});
    clearMessages();
  }, [initialFormState, clearMessages]);

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplateLoading(true);
      const result = await emailService.getTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
      setTemplateLoading(false);
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    if (resetForm) {
      handleReset();
    }
  }, [resetForm, handleReset]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name as keyof CreateEmailData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (error) {
      clearMessages();
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateEmailData> = {};

    if (!formData.fromName.trim()) errors.fromName = "From name is required";
    if (!formData.fromEmail.trim()) errors.fromEmail = "From email is required";
    if (!formData.toName.trim()) errors.toName = "To name is required";
    if (!formData.toEmail.trim()) errors.toEmail = "To email is required";
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";

    if (
      formData.toEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.toEmail)
    ) {
      errors.toEmail = "Please enter a valid email address";
    }

    if (!formData.sendNow) {
      if (!formData.scheduledFor) {
        errors.scheduledFor =
          "Scheduled date is required when not sending immediately";
      } else {
        const scheduledDate = new Date(formData.scheduledFor);
        const now = new Date();
        if (scheduledDate <= now) {
          errors.scheduledFor = "Scheduled date must be in the future";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData = {
      ...formData,
      scheduledFor: formData.sendNow
        ? undefined
        : formatDateTimeForServer(formData.scheduledFor),
    };

    const success = await createEmail(submitData);

    if (success) {
      setFormData(initialFormState);
      setValidationErrors({});
      onSuccess?.();
    }

    setIsSubmitting(false);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const currentLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          From Information
        </h3>
        <Input
          label="From Name *"
          name="fromName"
          value={formData.fromName}
          onChange={handleInputChange}
          disabled={currentLoading}
          error={validationErrors.fromName}
          placeholder="Enter sender name"
          required
        />
        <Input
          label="From Email *"
          name="fromEmail"
          type="email"
          value={formData.fromEmail}
          onChange={handleInputChange}
          disabled={currentLoading}
          error={validationErrors.fromEmail}
          placeholder="Enter sender email"
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          To Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="To Name *"
            name="toName"
            value={formData.toName}
            onChange={handleInputChange}
            disabled={currentLoading}
            error={validationErrors.toName}
            placeholder="Enter recipient name"
            required
          />

          <Input
            label="To Email *"
            name="toEmail"
            type="email"
            value={formData.toEmail}
            onChange={handleInputChange}
            disabled={currentLoading}
            error={validationErrors.toEmail}
            placeholder="Enter recipient email"
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Email Content
        </h3>

        <div className="space-y-4">
          <Input
            label="Subject *"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            disabled={currentLoading}
            error={validationErrors.subject}
            placeholder="Enter email subject"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={currentLoading}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.message ? "border-red-300" : ""
              }`}
              placeholder="Enter your message here..."
              required
            />
            {validationErrors.message && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Template
            </label>
            <select
              name="template"
              value={formData.template}
              onChange={handleInputChange}
              disabled={currentLoading || templateLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Default Template</option>
              <option value="business">Business Template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {templateLoading && (
              <p className="mt-1 text-xs text-gray-500">Loading templates...</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Send Options</h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="sendNow"
              name="sendNow"
              checked={formData.sendNow}
              onChange={handleInputChange}
              disabled={currentLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="sendNow"
              className="text-sm font-medium text-gray-700"
            >
              Send immediately
            </label>
          </div>

          {!formData.sendNow && (
            <div>
              <Input
                label="Schedule for *"
                name="scheduledFor"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={handleInputChange}
                disabled={currentLoading}
                error={validationErrors.scheduledFor}
                min={getMinDateTime()}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Select when you want this email to be sent (
                {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={currentLoading}
        >
          Reset Form
        </button>

        <Button
          type="submit"
          loading={currentLoading}
          disabled={currentLoading}
        >
          {formData.sendNow ? "Send Now" : "Schedule Email"}
        </Button>
      </div>
    </form>
  );
};
