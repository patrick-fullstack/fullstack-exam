import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, type User, type UpdateProfileRequest } from '../services/auth'; // ← Add 'type' keyword
import { Header } from '../components/layout/Header';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileEdit } from '../components/profile/ProfileEdit';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                if (userData) {
                    setUser(userData);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleEditClick = () => {
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
        if (!user) return;

        // Check if there are any changes
        if (Object.keys(updateData).length === 0) {
            setError('No changes to save');
            return;
        }

        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const result = await auth.updateProfile(user.id, updateData);

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setUser(result.user);
                setIsEditing(false);

                // Clear success message after 3 seconds
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
        if (!user) return '/';

        switch (user.role) {
            case 'super_admin': return '/admin-dashboard';
            case 'manager': return '/manager-dashboard';
            case 'employee': return '/employee-dashboard';
            default: return '/';
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <p>User not found</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title={isEditing ? "Edit Profile" : "Profile Information"}
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user.avatar}
                userName={user.firstName}
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

                    {/* Page Title */}
                    <div className="flex items-center justify-between mb-6">
                        <h2>{isEditing ? "Edit Profile" : "Profile Information"}</h2>
                        {!isEditing && (
                            <button
                                onClick={handleEditClick}
                                className="btn btn-primary"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success mb-6">
                            {success}
                        </div>
                    )}

                    {/* Profile Content */}
                    {isEditing ? (
                        <ProfileEdit
                            user={user}
                            onSave={handleSaveProfile}
                            onCancel={handleCancelEdit}
                            loading={updating}
                            error={error}
                        />
                    ) : (
                        <ProfileView
                            user={user}
                            onEditClick={handleEditClick}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}