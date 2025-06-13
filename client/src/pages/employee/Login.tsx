import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { LoginForm } from "../../components/forms/LoginForm";
import { useAuth } from "../../contexts/AuthContext";

export default function EmployeeLogin() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    // Pass the required role to enforce role-based login
    const result = await login(email, password, 'employee');

    if (result.success && result.user) {
      console.log('Employee login successful');
    } else {
      // Check if we got the actual role (role mismatch)
      if (result.actualRole) {
        setError(
          `Access denied. You are a ${result.actualRole.replace('_', ' ')}. Redirecting to correct portal...`
        );
      } else {
        setError(result.error || "Login failed");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className="flex-center"
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        {/* Header */}
        <Header
          title="Employee Portal"
          subtitle="Employee Access"
          variant="login"
        />

        {/* Login Form Component */}
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

        {/* Navigation - Using Link components instead of <a> tags */}
        <div className="mt-4 text-center">
          <p style={{ fontSize: "0.875rem", color: "var(--text-gray)" }}>
            Not an employee?
            <Link
              to="/admin-login"
              style={{ color: "var(--primary-green)", marginLeft: "0.25rem" }}
            >
              Admin Login
            </Link>{" "}
            |
            <Link
              to="/manager-login"
              style={{ color: "var(--primary-green)", marginLeft: "0.25rem" }}
            >
              Manager Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
