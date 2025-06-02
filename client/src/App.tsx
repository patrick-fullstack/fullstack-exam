import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { auth, authEvents } from './services/auth';
import type { User } from './services/auth';

// Import all pages
import PortalSelector from './pages/PortalSelector';
import AdminLogin from './pages/admin/Login';
import ManagerLogin from './pages/manager/Login';
import EmployeeLogin from './pages/employee/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check auth status
  const checkAuth = async () => {
    try {
      const isLoggedIn = auth.isLoggedIn();

      if (isLoggedIn) {
        const userData = await auth.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          await auth.logout();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      await auth.logout();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user's dashboard route
  const getUserDashboard = (userRole: string) => {
    switch (userRole) {
      case 'super_admin':
        return '/admin-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'employee':
        return '/employee-dashboard';
      default:
        return '/';
    }
  };

  // Check authentication status when app loads
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen to auth events (login, logout, token expiration)
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      checkAuth();
    });

    return unsubscribe;
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page - Redirect authenticated users to dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated && user ?
            <Navigate to={getUserDashboard(user.role)} replace /> :
            <PortalSelector />
        }
      />

      {/* Login pages - Redirect authenticated users to their dashboard */}
      <Route
        path="/admin-login"
        element={
          isAuthenticated && user ?
            <Navigate to={getUserDashboard(user.role)} replace /> :
            <AdminLogin />
        }
      />
      <Route
        path="/manager-login"
        element={
          isAuthenticated && user ?
            <Navigate to={getUserDashboard(user.role)} replace /> :
            <ManagerLogin />
        }
      />
      <Route
        path="/employee-login"
        element={
          isAuthenticated && user ?
            <Navigate to={getUserDashboard(user.role)} replace /> :
            <EmployeeLogin />
        }
      />

      {/* Dashboard routes - Show dashboard or redirect to appropriate login */}
      <Route
        path="/admin-dashboard"
        element={
          isAuthenticated && user?.role === 'super_admin' ?
            <AdminDashboard /> :
            <Navigate to="/admin-login" replace />
        }
      />
      <Route
        path="/manager-dashboard"
        element={
          isAuthenticated && user?.role === 'manager' ?
            <ManagerDashboard /> :
            <Navigate to="/manager-login" replace />
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          isAuthenticated && user?.role === 'employee' ?
            <EmployeeDashboard /> :
            <Navigate to="/employee-login" replace />
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}