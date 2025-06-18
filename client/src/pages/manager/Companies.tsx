import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyList } from "../../components/company/CompanyList";

export default function ManagerCompaniesPage() {
  const { user, logout } = useAuth();
  const { error, success, clearMessages } = useCompany();

  // Clear messages on mount
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title="Company Directory"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Companies Directory
              </h1>
              <p className="text-gray-600">
                Browse all companies in the system
              </p>
            </div>

            <div className="flex space-x-3">
              <Link to="/manager-dashboard" className="btn btn-secondary">
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {success && (
            <div className="alert alert-success flex justify-between items-center">
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error flex justify-between items-center">
              <span>{error}</span>
            </div>
          )}

          <CompanyList
            userRole={user?.role as "super_admin" | "manager" | "employee"}
          />
        </div>
      </main>
    </div>
  );
}
