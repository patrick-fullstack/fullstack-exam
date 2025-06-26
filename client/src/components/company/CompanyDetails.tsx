import { useState, useEffect } from "react";
import { EmployeeTable } from "./EmployeeTable";
import { CompanyForm } from "../forms/CompanyForm";
import { useCompany } from "../../hooks/company/queries/useCompany";
import { useUpdate } from "../../hooks/company/mutations/useUpdate";
import { useExport } from "../../hooks/company/mutations/useExport";
import { useAuth } from "../../contexts/AuthContext";
import type {
  CompanyDetailsProps,
  UpdateCompanyData,
} from "../../types/companies";
import { CompanyLogo } from "../ui/OptimizedImage";

export function CompanyDetails({
  company,
  companyId,
  loading,
  onUpdate,
}: CompanyDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const { company: updatedCompany, setCompany } = useCompany();
  const {
    updateCompany,
    loading: updating,
    error: updateError,
    success: updateSuccess,
    clearMessages: clearUpdateMessages,
  } = useUpdate();
  const {
    exportCompanyCSV,
    loading: isExporting,
    error: exportError,
    success: exportSuccess,
    clearMessages: clearExportMessages,
  } = useExport();

  const error = updateError || exportError;
  const success = updateSuccess || exportSuccess;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(companyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canEdit =
    user &&
    (user.role === "super_admin" ||
      (user.role === "manager" && user.companyId === companyId));

  const handleExportCSV = () => {
    exportCompanyCSV(companyId);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    clearUpdateMessages();
    clearExportMessages();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    clearUpdateMessages();
    clearExportMessages();
  };

  const handleUpdateCompany = async (updateData: UpdateCompanyData) => {
    const result = await updateCompany(companyId, updateData);
    if (result) {
      setCompany(result);
      if (onUpdate) {
        onUpdate(result);
      }
      setIsEditing(false);
    }
  };

  useEffect(() => {
    return () => {
      clearUpdateMessages();
      clearExportMessages();
    };
  }, [clearUpdateMessages, clearExportMessages]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        clearUpdateMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, clearUpdateMessages]);

  const displayCompany = updatedCompany || company;

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
            company={displayCompany}
            mode="edit"
            onSubmit={handleUpdateCompany}
            loading={updating}
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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-start space-x-3 md:space-x-4">
            <CompanyLogo company={displayCompany} context="card" />

            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                {displayCompany.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600 break-all">
                {displayCompany.email}
              </p>
              <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <a
              href={
                displayCompany.website.startsWith("http")
                  ? displayCompany.website
                  : `https://${displayCompany.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all text-sm md:text-base"
            >
              {displayCompany.website}
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="text-gray-900 text-sm md:text-base">
              {new Date(displayCompany.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <div className="text-gray-900 text-sm md:text-base">
              {new Date(displayCompany.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <EmployeeTable companyId={companyId} />
    </div>
  );
}
