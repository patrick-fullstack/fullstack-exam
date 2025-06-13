import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyDetails } from "../../components/company/CompanyDetails";

export default function CompanyEmployeeDetailPage() {
  const { user, logout } = useAuth();
  const { companyId } = useParams<{ companyId: string }>();
  const {
    currentCompany: company,
    currentCompanyLoading: loading,
    error,
    fetchCompany,
    clearCurrentCompany,
    clearMessages,
    setError,
  } = useCompany();

  // Fetch company with access control
  useEffect(() => {
    if (!companyId || !user) return;

    // Check if employee is accessing their own company
    if (user.role === "employee" && user.companyId !== companyId) {
      setError("Access denied. You can only view your own company.");
      return;
    }

    clearMessages();
    fetchCompany(companyId);

    // Cleanup on unmount
    return () => clearCurrentCompany();
  }, [
    companyId,
    user,
    fetchCompany,
    clearCurrentCompany,
    clearMessages,
    setError,
  ]);

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
          <Link to="/employee-dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">Loading company details...</div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card text-center py-12">
            <div className="text-red-500 text-lg mb-4">
              {error.includes("Access denied") ? "Access Denied" : "Error"}
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link to="/employee-dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Company Not Found */}
        {!company && !loading && !error && (
          <div className="card text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Company not found</div>
            <Link to="/employee-dashboard" className="btn btn-primary">
              Back to Dashboard
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
