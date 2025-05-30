import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { auth } from './services/auth';
import type { User } from './services/auth';

// Import all pages
import PortalSelector from './pages/PortalSelector';
import AdminLogin from './pages/admin/Login';
import ManagerLogin from './pages/manager/Login';
import EmployeeLogin from './pages/employee/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = auth.isLoggedIn();

        if (isLoggedIn) {
          const userData = await auth.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token exists but user fetch failed, clear token
            await auth.logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await auth.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Function to get the correct dashboard based on user role
  const getDashboardByRole = () => {
    if (!user) return <Navigate to="/" replace />;

    switch (user.role) {
      case 'super_admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  // ✅ Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing page - Portal selector */}
        <Route
          path="/"
          element={isAuthenticated ? getDashboardByRole() : <PortalSelector />}
        />

        {/* Login pages */}
        <Route
          path="/admin-login"
          element={isAuthenticated && user?.role === 'super_admin' ? <AdminDashboard /> : <AdminLogin />}
        />
        <Route
          path="/manager-login"
          element={isAuthenticated && user?.role === 'manager' ? <ManagerDashboard /> : <ManagerLogin />}
        />
        <Route
          path="/employee-login"
          element={isAuthenticated && user?.role === 'employee' ? <EmployeeDashboard /> : <EmployeeLogin />}
        />

        {/* Dashboard routes */}
        <Route
          path="/admin-dashboard"
          element={isAuthenticated && user?.role === 'super_admin' ? <AdminDashboard /> : <Navigate to="/admin-login" replace />}
        />
        <Route
          path="/manager-dashboard"
          element={isAuthenticated && user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/manager-login" replace />}
        />
        <Route
          path="/employee-dashboard"
          element={isAuthenticated && user?.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/employee-login" replace />}
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}