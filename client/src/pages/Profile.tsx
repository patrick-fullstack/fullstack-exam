import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, type User, type UpdateProfileRequest } from '../services/auth';
import { userService } from '../services/users';
import { Header } from '../components/layout/Header';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileEdit } from '../components/profile/ProfileEdit';
import { useSearchParams } from 'react-router-dom';


export default function ProfilePage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
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

    // Fetch current user data
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                if (userData) {
                    setCurrentUser(userData || null);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Failed to fetch current user:', error);
                setCurrentUser(null);
                navigate('/');
            }
        };

        fetchCurrentUser();
    }, [navigate]);

    // Fetch profile user data (either own profile or specific user)
    useEffect(() => {
        const fetchProfileUser = async () => {
            if (!currentUser) return;

            setLoading(true);
            setError('');

            try {
                // getUserById from userService
                const targetUserId = userId || currentUser.id;
                const result = await userService.getUserById(targetUserId);

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

    useEffect(() => {
        const editFromQuery = searchParams.get('edit') === 'true';
        if (editFromQuery && isOwnProfile) {
            setIsEditing(true);
        }
    }, [searchParams, isOwnProfile]);

    // Check if current user can edit this profile
    const canEditProfile = () => {
        if (!currentUser || !profileUser) return false;

        // Can always edit own profile
        if (isOwnProfile) return true;

        // Super admin can edit anyone
        if (currentUser.role === 'super_admin') return true;

        // Manager can edit employees in their company
        if (currentUser.role === 'manager') {
            return profileUser.companyId === currentUser.companyId &&
                profileUser.role === 'employee';
        }

        return false;
    };

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
            // Use different services based on whether editing own profile or others
            let result;

            if (isOwnProfile) {
                result = await auth.updateProfile(profileUser.id, updateData);
            } else {
                result = await userService.updateUser(profileUser.id, updateData);
            }

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setProfileUser(result.user);

                if (isOwnProfile) {
                    setCurrentUser(result.user);
                }

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

    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/', { replace: true });
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

    if (!currentUser || !profileUser) {
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

    // Get appropriate title based on viewing own profile or not
    const getPageTitle = () => {
        if (isEditing) return "Edit Profile";
        if (isOwnProfile) return "My Profile";
        return `${profileUser.firstName} ${profileUser.lastName}'s Profile`;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title={getPageTitle()}
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={currentUser.avatar}
                userName={currentUser.firstName}
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
                                <span>You are viewing another user's profile (read-only)</span>
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