import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyDetails } from "../../components/company/CompanyDetails";

export default function CompanyDetailPage() {
  const { user, logout } = useAuth();
  const { companyId } = useParams<{ companyId: string }>();
  const {
    currentCompany: company,
    currentCompanyLoading: loading,
    error,
    fetchCompany,
    clearCurrentCompany,
    clearMessages,
  } = useCompany();

  // Fetch company when companyId changes
  useEffect(() => {
    if (companyId && user) {
      clearMessages();
      fetchCompany(companyId);
    }

    // Cleanup on unmount
    return () => clearCurrentCompany();
  }, [companyId, user, fetchCompany, clearCurrentCompany, clearMessages]);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title={company ? `${company.name} - Details` : "Company Details"}
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="mb-4">
          <Link to="/admin/companies" className="btn btn-secondary">
            ← Back to Companies
          </Link>
        </div>

        {/* Loading from context */}
        {loading && (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="text-gray-500 mt-2">Loading company details...</p>
          </div>
        )}

        {/* Company not found */}
        {!company && !loading && !error && (
          <div className="card text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Company not found</div>
            <p className="text-gray-600 mb-4">
              The company you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/companies" className="btn btn-primary">
              Back to Companies
            </Link>
          </div>
        )}

        {/* Company details - AuthContext user passed automatically */}
        {company && !loading && (
          <CompanyDetails
            company={company}
            loading={false}
            companyId={companyId || ""}
          />
        )}
      </main>
    </div>
  );
}
