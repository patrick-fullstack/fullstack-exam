import { useState } from "react";
import { Link } from "react-router-dom";
import { useDelete } from "../../hooks/company/mutations/useDelete";
import type { CompanyCardProps } from "../../types/companies";
import { CompanyLogo } from "../ui/OptimizedImage";

export function CompanyCard({
  company,
  userRole,
  onDeleteSuccess,
}: CompanyCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteCompany, deletingId } = useDelete();

  const isDeleting = deletingId === company.id;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const success = await deleteCompany(company.id);

    // If deletion was successful and callback provided, call it
    if (success && onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
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
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CompanyLogo company={company} context="card" />

            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {company.name}
              </h3>
              <p className="text-sm text-gray-600">{company.email}</p>
            </div>
          </div>

          {userRole === "super_admin" && (
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
