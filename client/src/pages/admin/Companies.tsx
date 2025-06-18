import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompany } from "../../contexts/CompanyContext";
import { Header } from "../../components/layout/Header";
import { CompanyList } from "../../components/company/CompanyList";

export default function CompaniesPage() {
  const { user, logout } = useAuth();
  const { clearMessages } = useCompany();

  // Clear messages on mount
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title="Company Management"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600">
                {user?.role === "super_admin"
                  ? "Manage all companies in the system"
                  : "View your company information"}
              </p>
            </div>

            <div className="flex space-x-3">
              <Link to="/admin-dashboard" className="btn btn-secondary">
                ← Back to Dashboard
              </Link>
              {user?.role === "super_admin" && (
                <Link to="/admin/companies/create" className="btn btn-primary">
                  Create Company
                </Link>
              )}
            </div>
          </div>

          {/* Remove onError - context handles it */}
          <CompanyList
            userRole={user?.role as "super_admin" | "manager" | "employee"}
          />
        </div>
      </main>
    </div>
  );
}
