import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUser } from "../../contexts/UserContext";
import { Header } from "../../components/layout/Header";
import { CreateUserForm } from "../../components/forms/CreateUserForm";

export default function CreateUserPage() {
  const { user, logout } = useAuth();
  const { success } = useUser();
  const navigate = useNavigate();

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title="Create New User"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
        userRole={user?.role}
      />

      <main
        className="container"
        style={{ paddingTop: "2rem", maxWidth: "800px" }}
      >
        <div className="card mb-7">
          <div className="mb-6">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create New User
            </h2>
            <p className="text-gray-600">
              Add a new user to the system with appropriate role and permissions
            </p>
          </div>

          {success && (
            <div className="alert alert-success mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          <CreateUserForm />
        </div>
      </main>
    </div>
  );
}
