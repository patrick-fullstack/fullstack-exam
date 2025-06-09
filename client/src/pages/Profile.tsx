import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { userService } from '../services/users';
import { Header } from '../components/layout/Header';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileEdit } from '../components/profile/ProfileEdit';
import { useAuth } from '../contexts/AuthContext';
import { auth, type User, type UpdateProfileRequest } from '../services/auth';

export default function ProfilePage() {
    const { user: currentUser, logout, refreshUser } = useAuth();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams<{ userId?: string }>();
    const [searchParams] = useSearchParams();

    // Check if viewing own profile
    const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

    // Memoized permission check function to prevent infinite re-renders
    const canEditProfile = useCallback(() => {
        if (!currentUser || !profileUser) return false;

        // Can always edit own profile
        if (currentUser.id === profileUser.id) return true;

        // Super admin can edit anyone
        if (currentUser.role === 'super_admin') return true;

        // Manager can edit employees in their company
        if (currentUser.role === 'manager') {
            return profileUser.companyId === currentUser.companyId &&
                profileUser.role === 'employee';
        }

        return false;
    }, [currentUser, profileUser]);

    // Fetch profile user data (either own profile or specific user)
    useEffect(() => {
        const fetchProfileUser = async () => {
            if (!currentUser) return;

            setLoading(true);
            setError('');

            try {
                // Use current user data if viewing own profile and no userId specified
                if (!userId) {
                    setProfileUser(currentUser);
                    setLoading(false);
                    return;
                }

                // Fetch specific user by ID
                const result = await userService.getUserById(userId);

                if (result.success && result.user) {
                    setProfileUser(result.user);
                } else {
                    setError(result.error || 'Failed to load user profile');
                }
            } catch (error) {
                console.error('Failed to fetch profile user:', error);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileUser();
    }, [currentUser, userId]);

    // Handle edit mode from URL query parameter - Fixed dependency array
    useEffect(() => {
        const editFromQuery = searchParams.get('edit') === 'true';
        if (editFromQuery && canEditProfile()) {
            setIsEditing(true);
        }
    }, [searchParams, canEditProfile]);

    const handleEditClick = () => {
        if (!canEditProfile()) {
            setError('You do not have permission to edit this profile');
            return;
        }
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleSaveProfile = async (updateData: UpdateProfileRequest) => {
        if (!profileUser || !canEditProfile()) {
            setError('You do not have permission to edit this profile');
            return;
        }

        // Check if there are any changes
        if (Object.keys(updateData).length === 0) {
            setError('No changes to save');
            return;
        }

        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            let result;

            if (isOwnProfile) {
                // Use auth service for own profile
                result = await auth.updateProfile(profileUser.id, updateData);

                // Refresh user in context after updating own profile
                if (result.success) {
                    await refreshUser();
                }
            } else {
                // Use user service for other users
                result = await userService.updateUser(profileUser.id, updateData);
            }

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setProfileUser(result.user);
                setIsEditing(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            setError('An unexpected error occurred');
        } finally {
            setUpdating(false);
        }
    };

    const getDashboardRoute = () => {
        if (!currentUser) return '/';

        switch (currentUser.role) {
            case 'super_admin': return '/admin-dashboard';
            case 'manager': return '/manager-dashboard';
            case 'employee': return '/employee-dashboard';
            default: return '/';
        }
    };

    // Get appropriate title based on viewing own profile or not
    const getPageTitle = () => {
        if (isEditing) return "Edit Profile";
        if (isOwnProfile) return "My Profile";
        return `${profileUser?.firstName} ${profileUser?.lastName}'s Profile`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state - no profile user found
    if (!profileUser) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="card text-center">
                    <div className="text-red-500 text-lg mb-4">
                        {error || 'User not found'}
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
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title={getPageTitle()}
                variant="dashboard"
                onLogout={logout}
                userAvatar={currentUser?.avatar}
                userName={currentUser?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <div className="card">
                    {/* Back to Dashboard */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(getDashboardRoute())}
                            className="btn btn-secondary"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Page Title with User Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2>{getPageTitle()}</h2>
                            {!isOwnProfile && (
                                <p className="text-gray-600 text-sm mt-1">
                                    Viewing {profileUser.firstName} {profileUser.lastName}'s profile
                                </p>
                            )}
                        </div>

                        {/* Show edit button */}
                        {!isEditing && canEditProfile() && (
                            <button
                                onClick={handleEditClick}
                                className="btn btn-primary"
                            >
                                {isOwnProfile ? 'Edit Profile' : 'Edit User'}
                            </button>
                        )}
                    </div>

                    {/* Show access notice if viewing someone else's profile */}
                    {!isOwnProfile && (
                        <div className="alert alert-info mb-6">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>You are viewing another user's profile</span>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success mb-6">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-6">
                            {error}
                        </div>
                    )}

                    {/* Profile Content */}
                    {isEditing && canEditProfile() ? (
                        <ProfileEdit
                            user={profileUser}
                            currentUser={currentUser}
                            onSave={handleSaveProfile}
                            onCancel={handleCancelEdit}
                            loading={updating}
                            error={error}
                        />
                    ) : (
                        <ProfileView
                            user={profileUser}
                            onEditClick={canEditProfile() ? handleEditClick : () => { }}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}