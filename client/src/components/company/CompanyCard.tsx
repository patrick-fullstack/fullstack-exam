import { useState } from "react";
import { Link } from "react-router-dom";
import type { CompanyCardProps } from "../../types/companies";

export function CompanyCard({
  company,
  onDelete,
  isDeleting,
  userRole,
}: CompanyCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(company.id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Company
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong>{company.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card hover:shadow-md transition-shadow">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-500">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Company Info */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {company.name}
              </h3>
              <p className="text-sm text-gray-600">{company.email}</p>
            </div>
          </div>

          {/* Actions for Super Admin */}
          {userRole === "super_admin" && onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="btn btn-danger btn-sm"
              style={{ padding: "0.5rem", fontSize: "0.75rem" }}
              title="Delete Company"
            >
              {isDeleting ? "..." : "🗑️"}
            </button>
          )}
        </div>

        {/* Company Details */}
        <div className="space-y-3 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Website:</span>
            <a
              href={
                company.website.startsWith("http")
                  ? company.website
                  : `https://${company.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 ml-2 break-all"
            >
              {company.website}
            </a>
          </div>

          {company.users && (
            <div>
              <span className="text-sm font-medium text-gray-700">
                Employees:
              </span>
              <span className="text-sm text-gray-600 ml-2">
                {company.users.length}{" "}
                {company.users.length === 1 ? "employee" : "employees"}
              </span>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-700">Created:</span>
            <span className="text-sm text-gray-600 ml-2">
              {new Date(company.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <div
          className="pt-4 border-t"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Link
            to={`/admin/companies/${company.id}`}
            className="btn btn-primary w-full"
          >
            View Details & Employees
          </Link>
        </div>
      </div>
    </>
  );
}
