import { useState } from "react";
import { EmployeeTable } from "./EmployeeTable";
import { CompanyForm } from "../forms/CompanyForm";
import { useCompany } from "../../contexts/CompanyContext";
import { useAuth } from "../../contexts/AuthContext";
import type {
  CompanyDetailsProps,
  UpdateCompanyData,
} from "../../types/companies";

export function CompanyDetails({
  company,
  companyId,
  loading,
  onUpdate,
  currentUser,
}: CompanyDetailsProps) {
  const [copied, setCopied] = useState(false);
  const { user: authUser } = useAuth();
  const user = currentUser || authUser;
  const {
    isEditing,
    updating,
    isExporting,
    error,
    success,
    currentCompany,
    setIsEditing,
    updateCompany,
    exportCompanyCSV,
    clearMessages,
  } = useCompany();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(companyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const canEdit =
    user &&
    (user.role === "super_admin" ||
      (user.role === "manager" && user.companyId === companyId));

  // Use context methods - much simpler!
  const handleExportCSV = () => {
    exportCompanyCSV(companyId);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    clearMessages();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    clearMessages();
  };

  const handleUpdateCompany = async (updateData: UpdateCompanyData) => {
    const result = await updateCompany(companyId, updateData);
    if (result && onUpdate && currentCompany) {
      onUpdate(currentCompany);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (isEditing && canEdit) {
    return (
      <div className="space-y-4 md:space-y-6">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Edit Company
            </h2>
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary w-full sm:w-auto"
              disabled={updating}
            >
              Cancel
            </button>
          </div>

          <CompanyForm
            company={company}
            mode="edit"
            onSubmit={handleUpdateCompany}
            loading={updating}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 mb-4 md:mb-7">
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {/* Mobile-first header layout */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-start space-x-3 md:space-x-4">
            {/* Smaller logo on mobile */}
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg md:text-2xl font-bold text-gray-500">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                {company.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600 break-all">
                {company.email}
              </p>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <span className="hidden sm:inline">ID:</span>
                <span className="font-mono text-xs truncate max-w-[120px] sm:max-w-none">
                  {companyId}
                </span>
                <button
                  onClick={copyToClipboard}
                  className={`p-0.5 rounded transition-colors flex-shrink-0 ${
                    copied
                      ? "text-green-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Copy Company ID"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        copied
                          ? "M5 13l4 4L19 7"
                          : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-friendly action buttons */}
          {canEdit && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="btn btn-secondary text-sm"
                title="Export company data to CSV"
              >
                {isExporting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    <span className="hidden sm:inline">Exporting...</span>
                    <span className="sm:hidden">Export...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </>
                )}
              </button>

              <button
                onClick={handleEditClick}
                className="btn btn-primary text-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="hidden sm:inline">Edit Company</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          )}
        </div>

        {/* Company Details Grid - Stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <a
              href={
                company.website.startsWith("http")
                  ? company.website
                  : `https://${company.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all text-sm md:text-base"
            >
              {company.website}
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="text-gray-900 text-sm md:text-base">
              {new Date(company.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <div className="text-gray-900 text-sm md:text-base">
              {new Date(company.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* EmployeeTable - Already responsive */}
      <EmployeeTable
        companyId={companyId}
        onError={() => {}}
        onSuccess={() => {}}
      />
    </div>
  );
}
