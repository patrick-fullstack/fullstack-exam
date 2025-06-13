import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyForm } from "../../components/forms/CompanyForm";

export default function CreateCompanyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    createCompany,
    companiesLoading: creating,
    success,
    clearMessages,
  } = useCompany();

  // Clear messages on mount
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  // Auto-navigate on success
  useEffect(() => {
    if (success && success.includes("created successfully")) {
      const timer = setTimeout(() => {
        navigate("/admin/companies", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title="Create Company"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      <main
        className="container"
        style={{ paddingTop: "2rem", maxWidth: "600px" }}
      >
        <div className="card">
          <div className="mb-6">
            <Link to="/admin/companies" className="btn btn-secondary">
              ← Back to Companies
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Company
            </h1>
            <p className="text-gray-600">Add a new company to the system</p>
          </div>

          {/* Context provides success messages */}
          {success && (
            <div className="alert alert-success mb-6">
              {success}
              {success.includes("created successfully") && (
                <div className="text-sm mt-1">Redirecting...</div>
              )}
            </div>
          )}

          {/* Use context method directly */}
          <CompanyForm
            onSubmit={createCompany}
            loading={creating}
            mode="create"
          />
        </div>
      </main>
    </div>
  );
}
