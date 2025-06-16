import React, { useState, useEffect } from "react";
import { EmailViewer } from "./EmailView";
import { useEmail } from "../../contexts/EmailContext";

interface EmailListProps {
  onError?: (error: string) => void;
  refreshTrigger?: number;
}

export const EmailList: React.FC<EmailListProps> = ({
  onError,
  refreshTrigger,
}) => {
  const {
    emails,
    loading,
    error,
    pagination,
    loadEmails,
    cancelEmail,
    retryEmail,
    clearError
  } = useEmail();

  const [statusFilter, setStatusFilter] = useState("");
  const [viewingEmailId, setViewingEmailId] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadEmails(1, statusFilter);
  }, [statusFilter, refreshTrigger, loadEmails]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
      clearError();
    }
  }, [error, onError, clearError]);

  const handleViewEmail = (emailId: string) => {
    setViewingEmailId(emailId);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setViewingEmailId(null);
  };

  const handlePageChange = (page: number) => {
    loadEmails(page, statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    loadEmails(1, status);
  };

  const handleCancel = async (emailId: string) => {
    setActionLoading(emailId);
    const success = await cancelEmail(emailId);
    if (!success && error && onError) {
      onError(error);
    }
    setActionLoading(null);
  };

  const handleRetry = async (emailId: string) => {
    setActionLoading(emailId);
    const success = await retryEmail(emailId);
    if (!success && error && onError) {
      onError(error);
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading emails...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total Emails: {pagination.totalEmails}
        </div>
      </div>

      {/* Email List */}
      {emails.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📧</div>
          <p className="text-gray-500 text-lg">No emails found</p>
          <p className="text-gray-400 text-sm">
            {statusFilter
              ? `No emails found with status "${statusFilter}"`
              : "Start by creating your first email"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {emails.map((email) => (
                <li key={email._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {email.subject}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              To: {email.toName} ({email.toEmail})
                            </span>
                            <span>From: {email.fromName}</span>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {getStatusBadge(email.status)}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {email.message}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Template: {email.template}</span>
                          <span>Created: {formatDate(email.createdAt)}</span>
                          {email.scheduledFor && (
                            <span>
                              Scheduled: {formatDate(email.scheduledFor)}
                            </span>
                          )}
                          {email.sentAt && (
                            <span>Sent: {formatDate(email.sentAt)}</span>
                          )}
                        </div>
                      </div>

                      {email.errorMessage && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600">
                            Error: {email.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleViewEmail(email._id)}
                        className="px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View
                      </button>

                      {email.status === "pending" && (
                        <button
                          onClick={() => handleCancel(email._id)}
                          disabled={actionLoading === email._id}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {actionLoading === email._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}

                      {email.status === "failed" && (
                        <button
                          onClick={() => handleRetry(email._id)}
                          disabled={actionLoading === email._id}
                          className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {actionLoading === email._id ? "Retrying..." : "Retry"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm text-gray-700">
                Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                {Math.min(pagination.currentPage * 10, pagination.totalEmails)} of{" "}
                {pagination.totalEmails} emails
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${page === pagination.currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <EmailViewer
        emailId={viewingEmailId}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        onError={onError}
      />
    </div>
  );
};