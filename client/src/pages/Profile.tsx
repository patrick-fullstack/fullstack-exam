import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { ProfileView } from "../components/profile/ProfileView";
import { ProfileEdit } from "../components/profile/ProfileEdit";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";

export default function ProfilePage() {
  const { user: currentUser, logout } = useAuth();
  const {
    profileUser,
    loading,
    error,
    success,
    isEditing,
    canEditProfile,
    fetchProfileUser,
    getPageTitle,
    getDashboardRoute,
  } = useUser();

  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();

  // Fetch profile user data on component mount
  useEffect(() => {
    fetchProfileUser(userId);
  }, [fetchProfileUser, userId]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="card text-center">
          <div className="text-red-500 text-lg mb-4">
            {error || "User not found"}
          </div>
          <button
            onClick={() => navigate(getDashboardRoute())}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--background-gray)" }}
    >
      <Header
        title={getPageTitle()}
        variant="dashboard"
        onLogout={logout}
        userAvatar={currentUser?.avatar}
        userName={currentUser?.firstName}
      />

      <main
        className="container"
        style={{ paddingTop: "2rem", maxWidth: "800px" }}
      >
        <div className="card mb-7">
          <div className="mb-6">
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="btn btn-secondary"
            >
              ← Back to Dashboard
            </button>
          </div>

          <ProfileHeader />

          {success && <div className="alert alert-success mb-6">{success}</div>}
          {error && <div className="alert alert-error mb-6">{error}</div>}

          {isEditing && canEditProfile() ? <ProfileEdit /> : <ProfileView />}
        </div>
      </main>
    </div>
  );
}

function ProfileHeader() {
  const {
    profileUser,
    isOwnProfile,
    isEditing,
    canEditProfile,
    handleEditClick,
  } = useUser();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>
            {isEditing
              ? "Edit Profile"
              : isOwnProfile
              ? "My Profile"
              : `${profileUser?.firstName} ${profileUser?.lastName}'s Profile`}
          </h2>
          {!isOwnProfile && profileUser && (
            <p className="text-gray-600 text-sm mt-1">
              Viewing {profileUser.firstName} {profileUser.lastName}'s profile
            </p>
          )}
        </div>

        {!isEditing && canEditProfile() && (
          <button onClick={handleEditClick} className="btn btn-primary">
            {isOwnProfile ? "Edit Profile" : "Edit User"}
          </button>
        )}
      </div>

      {!isOwnProfile && (
        <div className="alert alert-info mb-6">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>You are viewing another user's profile</span>
          </div>
        </div>
      )}
    </>
  );
}
