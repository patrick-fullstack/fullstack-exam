import React, { useState, useEffect } from "react";
import { emailService } from "../../services/email";
import type { ScheduledEmail } from "../../types/emails";

interface EmailViewerProps {
  emailId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onError: (error: string) => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  emailId,
  isOpen,
  onClose,
  onError,
}) => {
  const [email, setEmail] = useState<ScheduledEmail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailId && isOpen) {
      loadEmail();
    }
  }, [emailId, isOpen]);

  const loadEmail = async () => {
    if (!emailId) return;

    try {
      setLoading(true);
      const result = await emailService.getEmailById(emailId);

      if (result.success && result.data) {
        setEmail(result.data);
      } else {
        onError(result.error || "Failed to load email details");
        onClose();
      }
    } catch (error) {
      console.error("Load email details error:", error);
      onError("Failed to load email details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-orange-600",
      sent: "text-green-600",
      failed: "text-red-600",
      cancelled: "text-gray-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Email Layout */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 text-lg">Loading email...</span>
              </div>
            </div>
          ) : email ? (
            <>
              {/* Email Header - Like Gmail */}
              <div className="border-b border-gray-200 bg-white">
                {/* Top Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Close"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <h2 className="text-lg font-medium text-gray-900">
                      Email Details
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        email.status
                      )}`}
                    >
                      {email.status.charAt(0).toUpperCase() +
                        email.status.slice(1)}
                    </span>
                    <div className="text-xs text-gray-500 font-mono">
                      ID: {email._id.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Email Subject */}
                <div className="px-6 py-4">
                  <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">
                    {email.subject}
                  </h1>
                </div>

                {/* Email Meta Info */}
                <div className="px-6 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {email.fromName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Sender Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {email.fromName}
                          </span>
                          <span className="text-gray-500 text-sm">
                            &lt;{email.fromEmail}&gt;
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>to </span>
                          <span className="font-medium">{email.toName}</span>
                          <span className="text-gray-500">
                            {" "}
                            &lt;{email.toEmail}&gt;
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatDateShort(email.createdAt)}
                      </div>
                      {email.sentAt && email.sentAt !== email.createdAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Sent: {formatDateShort(email.sentAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="overflow-y-auto max-h-[calc(95vh-240px)]">
                <div className="p-6">
                  {/* Main Email Content */}
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-base">
                      {email.message}
                    </div>
                  </div>

                  {/* Email Footer - Technical Details */}
                  <div className="mt-12 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                      {/* Template */}
                      <div>
                        <div className="text-gray-500 font-medium mb-1">
                          Template
                        </div>
                        <div className="text-gray-900">
                          {email.template === "default"
                            ? "Default"
                            : "Business Professional"}
                        </div>
                      </div>

                      {/* Delivery Method */}
                      <div>
                        <div className="text-gray-500 font-medium mb-1">
                          Delivery
                        </div>
                        <div className="text-gray-900">
                          {email.sendNow ? "Immediate" : "Scheduled"}
                        </div>
                      </div>

                      {/* Created By */}
                      {email.createdBy && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Created By
                          </div>
                          <div className="text-gray-900">
                            {email.createdBy.firstName}{" "}
                            {email.createdBy.lastName}
                          </div>
                        </div>
                      )}

                      {/* Company */}
                      {email.companyId && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Company
                          </div>
                          <div className="text-gray-900">
                            {email.companyId.name}
                          </div>
                        </div>
                      )}

                      {/* Scheduled For */}
                      {email.scheduledFor && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Scheduled For
                          </div>
                          <div className="text-gray-900">
                            {formatDate(email.scheduledFor)}
                          </div>
                        </div>
                      )}

                      {/* Failed At */}
                      {email.failedAt && (
                        <div>
                          <div className="text-red-500 font-medium mb-1">
                            Failed At
                          </div>
                          <div className="text-red-700">
                            {formatDate(email.failedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {email.errorMessage && (
                      <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
                        <div className="text-red-700 font-medium mb-1">
                          Error Details
                        </div>
                        <div className="text-red-600 text-sm">
                          {email.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Email not found
                </h3>
                <p className="text-gray-500">
                  The email you're looking for doesn't exist or has been
                  deleted.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
