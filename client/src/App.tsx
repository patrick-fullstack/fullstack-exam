import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoutes";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CompanyProvider } from "./contexts/CompanyContext";
// Pages
import PortalSelector from "./pages/PortalSelector";
import AdminLogin from "./pages/admin/Login";
import ManagerLogin from "./pages/manager/Login";
import EmployeeLogin from "./pages/employee/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import ProfilePage from "./pages/Profile";
import CreateUserPage from "./pages/admin/CreateUser";
import CompaniesPage from "./pages/admin/Companies";
import CreateCompanyPage from "./pages/admin/CreateCompany";
import CompanyDetailPage from "./pages/admin/CompanyDetail";
import CompanyEmployeeDetailPage from "./pages/employee/CompanyDetail";
import ManagerCompaniesPage from "./pages/manager/Companies";
import ManagerCompanyDetailPage from "./pages/manager/CompanyDetail";
import AdminEmailManagement from "./pages/admin/EmailManagement";
import AdminCreateEmail from "./pages/admin/CreateEmail";
import ManagerEmailManagement from "./pages/manager/EmailManagement";
import ManagerCreateEmail from "./pages/manager/CreateEmail";

function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing Page - Smart redirect */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <PortalSelector />
          )
        }
      />

      {/* Login Pages - Redirect if already logged in */}
      <Route
        path="/admin-login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <AdminLogin />
          )
        }
      />
      <Route
        path="/manager-login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <ManagerLogin />
          )
        }
      />
      <Route
        path="/employee-login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getUserDashboard(user.role)} replace />
          ) : (
            <EmployeeLogin />
          )
        }
      />

      {/* ADMIN ROUTES - Protected */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <CompaniesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies/create"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <CreateCompanyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies/:companyId"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin", "manager", "employee"]}
            redirectTo="/admin-login"
          >
            <CompanyDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-user"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <CreateUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/emails"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <AdminEmailManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/emails/create"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin"]}
            redirectTo="/admin-login"
          >
            <AdminCreateEmail />
          </ProtectedRoute>
        }
      />

      {/* MANAGER ROUTES - Protected */}
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute
            requiredRoles={["manager"]}
            redirectTo="/manager-login"
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/companies"
        element={
          <ProtectedRoute
            requiredRoles={["manager"]}
            redirectTo="/manager-login"
          >
            <ManagerCompaniesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/company/:companyId"
        element={
          <ProtectedRoute
            requiredRoles={["manager"]}
            redirectTo="/manager-login"
          >
            <ManagerCompanyDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/emails"
        element={
          <ProtectedRoute
            requiredRoles={["manager"]}
            redirectTo="/manager-login"
          >
            <ManagerEmailManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/emails/create"
        element={
          <ProtectedRoute
            requiredRoles={["manager"]}
            redirectTo="/manager-login"
          >
            <ManagerCreateEmail />
          </ProtectedRoute>
        }
      />

      {/* EMPLOYEE ROUTES - Protected */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute
            requiredRoles={["employee"]}
            redirectTo="/employee-login"
          >
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/company/:companyId"
        element={
          <ProtectedRoute
            requiredRoles={["employee"]}
            redirectTo="/employee-login"
          >
            <CompanyEmployeeDetailPage />
          </ProtectedRoute>
        }
      />

      {/* PROFILE ROUTES - Any authenticated user */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin", "manager", "employee"]}
            redirectTo="/"
          >
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute
            requiredRoles={["super_admin", "manager", "employee"]}
            redirectTo="/"
          >
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const getUserDashboard = (role: string): string => {
  switch (role) {
    case "super_admin":
      return "/admin-dashboard";
    case "manager":
      return "/manager-dashboard";
    case "employee":
      return "/employee-dashboard";
    default:
      return "/";
  }
};

// Main App Component
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanyProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </CompanyProvider>
      </AuthProvider>
    </Router>
  );
}
