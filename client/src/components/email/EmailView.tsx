import React, { useEffect, useCallback } from "react";
import { useEmail } from "../../hooks/email/queries/useEmail";

interface EmailViewerProps {
  emailId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onError?: (error: string) => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  emailId,
  isOpen,
  onClose,
  onError,
}) => {
  // Only use the single email query hook
  const { currentEmail, getEmailById, setCurrentEmail, error, loading } =
    useEmail();

  const loadEmail = useCallback(async () => {
    if (!emailId) return;
    await getEmailById(emailId);
  }, [emailId, getEmailById]);

  useEffect(() => {
    if (emailId && isOpen) {
      loadEmail();
    }

    return () => {
      if (!isOpen) {
        setCurrentEmail(null);
      }
    };
  }, [emailId, isOpen, loadEmail, setCurrentEmail]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
      onClose();
    }
  }, [error, onError, onClose]);

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

  const getTemplateDisplayName = (template: string) => {
    const templateNames = {
      default: "Default",
      business: "Business Professional",
    };
    return templateNames[template as keyof typeof templateNames] || template;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
          {!currentEmail || loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 text-lg">Loading email...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 bg-white">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <h2 className="text-lg font-medium text-gray-900">
                      Email Details
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        currentEmail.status
                      )} bg-opacity-10`}
                    >
                      {currentEmail.status.charAt(0).toUpperCase() +
                        currentEmail.status.slice(1)}
                    </span>
                    <div className="text-xs text-gray-500 font-mono">
                      ID: {currentEmail._id.slice(-8)}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">
                    {currentEmail.subject}
                  </h1>
                </div>

                <div className="px-6 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {currentEmail.fromName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {currentEmail.fromName}
                          </span>
                          <span className="text-gray-500 text-sm">
                            &lt;{currentEmail.fromEmail}&gt;
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>to </span>
                          <span className="font-medium">
                            {currentEmail.toName}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            &lt;{currentEmail.toEmail}&gt;
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatDateShort(currentEmail.createdAt)}
                      </div>
                      {currentEmail.sentAt &&
                        currentEmail.sentAt !== currentEmail.createdAt && (
                          <div className="text-xs text-green-600 mt-1">
                            Sent: {formatDateShort(currentEmail.sentAt)}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(95vh-240px)]">
                <div className="p-6">
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-base">
                      {currentEmail.message}
                    </div>
                  </div>

                  <div className="mt-12 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                      <div>
                        <div className="text-gray-500 font-medium mb-1">
                          Template
                        </div>
                        <div className="text-gray-900">
                          {getTemplateDisplayName(currentEmail.template)}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 font-medium mb-1">
                          Delivery Type
                        </div>
                        <div className="text-gray-900">
                          {currentEmail.sendNow ? "Immediate" : "Scheduled"}
                        </div>
                      </div>

                      {currentEmail.createdBy && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Created By
                          </div>
                          <div className="text-gray-900">
                            {currentEmail.createdBy.firstName}{" "}
                            {currentEmail.createdBy.lastName}
                          </div>
                        </div>
                      )}

                      {currentEmail.companyId && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Company
                          </div>
                          <div className="text-gray-900">
                            {currentEmail.companyId.name}
                          </div>
                        </div>
                      )}

                      {currentEmail.scheduledFor && (
                        <div>
                          <div className="text-gray-500 font-medium mb-1">
                            Scheduled For
                          </div>
                          <div className="text-gray-900">
                            {formatDate(currentEmail.scheduledFor)}
                          </div>
                        </div>
                      )}

                      {currentEmail.failedAt && (
                        <div>
                          <div className="text-red-500 font-medium mb-1">
                            Failed At
                          </div>
                          <div className="text-red-700">
                            {formatDate(currentEmail.failedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    {currentEmail.errorMessage && (
                      <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
                        <div className="text-red-700 font-medium mb-1">
                          Error Details
                        </div>
                        <div className="text-red-600 text-sm">
                          {currentEmail.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
