import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo,
  fallback
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // SHOW LOADING WHILE CHECKING AUTH
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // REDIRECT IF NOT AUTHENTICATED
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // CHECK ROLE PERMISSIONS
  if (!requiredRoles.includes(user.role)) {
    // Show fallback or redirect to their correct dashboard
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to their appropriate dashboard
    const userDashboard = getUserDashboard(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  // RENDER PROTECTED CONTENT
  return <>{children}</>;
};

// Helper function to get user's dashboard
const getUserDashboard = (role: string): string => {
  switch (role) {
    case 'super_admin': return '/admin-dashboard';
    case 'manager': return '/manager-dashboard';
    case 'employee': return '/employee-dashboard';
    default: return '/';
  }
};