import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyDetails } from "../../components/company/CompanyDetails";

export default function ManagerCompanyDetailPage() {
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
      {/* Header */}
      <Header
        title={company ? `${company.name} - Details` : "Company Details"}
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      {/* Content */}
      <main className="container" style={{ paddingTop: "2rem" }}>
        {/* Back Button */}
        <div className="mb-4">
          <Link to="/manager/companies" className="btn btn-secondary">
            ← Back to Companies
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">Loading company details...</div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card text-center py-12">
            <div className="text-red-500 text-lg mb-4">Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/manager/companies" className="btn btn-primary">
              Back to Companies
            </Link>
          </div>
        )}

        {/* Company Not Found */}
        {!company && !loading && !error && (
          <div className="card text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Company not found</div>
            <Link to="/manager/companies" className="btn btn-primary">
              Back to Companies
            </Link>
          </div>
        )}

        {/* Success State */}
        {company && !loading && !error && (
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
