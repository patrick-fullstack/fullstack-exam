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

  // Helper function to redirect authenticated users to their dashboard
  const getAuthenticatedRedirect = () => {
    if (!isAuthenticated || !user) return null;
    
    switch (user.role) {
      case 'super_admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'manager':
        return <Navigate to="/manager-dashboard" replace />;
      case 'employee':
        return <Navigate to="/employee-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
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
      {/* Landing page - Portal selector */}
      <Route
        path="/"
        element={isAuthenticated ? getAuthenticatedRedirect() : <PortalSelector />}
      />

      {/* Login pages - Allow access even if authenticated */}
      <Route
        path="/admin-login"
        element={<AdminLogin />}
      />
      <Route
        path="/manager-login"
        element={<ManagerLogin />}
      />
      <Route
        path="/employee-login"
        element={<EmployeeLogin />}
      />

      {/* Dashboard routes - Show dashboard or redirect to login */}
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