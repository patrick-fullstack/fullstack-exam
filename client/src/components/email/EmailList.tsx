import React, { useState, useEffect } from "react";
import { EmailViewer } from "./EmailView";
import { emailService } from "../../services/email";
import type { ScheduledEmail, EmailListProps } from "../../types/emails";

export const EmailList: React.FC<EmailListProps> = ({
  onError,
  refreshTrigger,
}) => {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewingEmailId, setViewingEmailId] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Enhanced pagination state matching EmployeeTable
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalEmails: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    emailsPerPage: number;
  }>({
    currentPage: 1,
    totalPages: 1,
    totalEmails: 0,
    hasNextPage: false,
    hasPrevPage: false,
    emailsPerPage: 10,
  });

  const loadEmails = async () => {
    try {
      setLoading(true);
      const result = await emailService.getEmails({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });

      if (result.success && result.data) {
        setEmails(result.data.emails);
        // Update pagination state with full data
        setPagination(result.data.pagination);
      } else {
        onError(result.error || "Failed to load emails");
      }
    } catch (error) {
      console.error("Load emails error:", error);
      onError("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmail = (emailId: string) => {
    setViewingEmailId(emailId);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setViewingEmailId(null);
  };

  useEffect(() => {
    loadEmails();
  }, [currentPage, statusFilter, refreshTrigger]);

  // Handle page change - matching EmployeeTable pattern
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleCancel = async (emailId: string) => {
    try {
      setActionLoading(emailId);
      const result = await emailService.cancelEmail(emailId);

      if (result.success) {
        await loadEmails(); // Refresh the list
      } else {
        onError(result.error || "Failed to cancel email");
      }
    } catch (error) {
      console.error("Cancel email error:", error);
      onError("Failed to cancel email");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (emailId: string) => {
    try {
      setActionLoading(emailId);
      const result = await emailService.retryEmail(emailId);

      if (result.success) {
        await loadEmails(); // Refresh the list
      } else {
        onError(result.error || "Failed to retry email");
      }
    } catch (error) {
      console.error("Retry email error:", error);
      onError("Failed to retry email");
    } finally {
      setActionLoading(null);
    }
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
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
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Email count display */}
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
                      {/* View button - always available */}
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
                          {actionLoading === email._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}

                      {email.status === "failed" && (
                        <button
                          onClick={() => handleRetry(email._id)}
                          disabled={actionLoading === email._id}
                          className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {actionLoading === email._id
                            ? "Retrying..."
                            : "Retry"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Pagination - Copied from EmployeeTable */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-6">
              {/* Results info */}
              <div className="text-sm text-gray-700">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.emailsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.emailsPerPage,
                  pagination.totalEmails
                )}{" "}
                of {pagination.totalEmails} emails
              </div>

              {/* Pagination buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                {/* Page numbers - Show all pages */}
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`btn ${
                        page === pagination.currentPage
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn btn-secondary"
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
