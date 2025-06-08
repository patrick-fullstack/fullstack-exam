import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Header } from "../../components/layout/Header";

export default function ManagerDashboard() {
  const { user, logout } = useAuth();

  // All your existing UI - NO CHANGES
  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      {/* Header */}
      <Header
        title="Manager Dashboard"
        variant="dashboard"
        onLogout={logout}
        userAvatar={user?.avatar}
        userName={user?.firstName}
      />

      {/* Content */}
      <main className="container" style={{ paddingTop: "2rem" }}>
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Company Manager Dashboard
                </p>

                {/* User Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Email
                    </div>
                    <div className="text-gray-900">{user?.email}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Role
                    </div>
                    <div className="text-gray-900">Manager</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Access Level
                    </div>
                    <div className="text-gray-900">Company Management</div>
                  </div>
                </div>
              </div>

              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Simple */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manage My Company */}
              {user?.companyId && (
                <Link
                  to={`/manager/company/${user.companyId}`}
                  className="group block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Manage My Company
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage your company's employees
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Browse All Companies */}
              <Link
                to="/manager/companies"
                className="group block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Browse Companies
                    </h3>
                    <p className="text-sm text-gray-600">
                      View all companies in the system
                    </p>
                  </div>
                </div>
              </Link>
              {/* Email Management */}
              <Link
                to="/manager/emails"
                className="group block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Email Management
                    </h3>
                    <p className="text-sm text-gray-600">
                      Send and manage email communications
                    </p>
                  </div>
                </div>
              </Link>

              {/* Send Email */}
              <Link
                to="/manager/emails/create"
                className="group block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Send Email
                    </h3>
                    <p className="text-sm text-gray-600">
                      Compose and send a new email
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
