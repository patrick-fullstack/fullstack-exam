import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../hooks/company/queries/useCompany";
import { Header } from "../../components/layout/Header";
import { CompanyDetails } from "../../components/company/CompanyDetails";

export default function ManagerCompanyDetailPage() {
  const { user, logout } = useAuth();
  const { companyId } = useParams<{ companyId: string }>();
  const { company, loading, error, fetchCompany, clearCompany } = useCompany();

  useEffect(() => {
    if (companyId && user) {
      fetchCompany(companyId);
    }
    return () => clearCompany();
  }, [companyId, user, fetchCompany, clearCompany]);

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
