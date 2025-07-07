import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../hooks/company/queries/useCompany";
import { Header } from "../../components/layout/Header";
import { CompanyDetails } from "../../components/company/CompanyDetails";

export default function CompanyEmployeeDetailPage() {
  const { user, logout } = useAuth();
  const { companyId } = useParams<{ companyId: string }>();
  const { company, loading, error, fetchCompany, clearCompany } = useCompany();
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    if (!companyId || !user) return;

    if (user.role === "employee" && user.companyId !== companyId) {
      setAccessError("Access denied. You can only view your own company.");
      return;
    }

    fetchCompany(companyId);
    return () => clearCompany();
  }, [companyId, user, fetchCompany, clearCompany]);

  const displayError = accessError || error;

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
          <Link to="/employee-dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {loading && (
          <div className="text-center py-8">Loading company details...</div>
        )}

        {displayError && !loading && (
          <div className="card text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              {displayError.includes("Access denied")
                ? "Access Denied"
                : "Error"}
            </div>
            <p className="text-gray-600 mb-4">{displayError}</p>
            <Link to="/employee-dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        )}

        {!company && !loading && !displayError && (
          <div className="card text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Company not found</div>
            <Link to="/employee-dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        )}

        {company && !loading && !displayError && (
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
