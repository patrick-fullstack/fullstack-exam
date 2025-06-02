import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { userService } from '../../services/users';
import { Header } from '../../components/layout/Header';
import { CreateUserForm, type CreateUserData } from '../../components/forms/CreateUserForm';

export default function CreateUserPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Check authentication and permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const userData = await auth.getCurrentUser();

                if (!userData) {
                    navigate('/admin-login', { replace: true });
                    return;
                }

                // Only super admins can access this page
                if (userData.role !== 'super_admin') {
                    navigate('/admin-dashboard', { replace: true });
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error('Failed to check permissions:', error);
                navigate('/admin-login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkPermissions();
    }, [navigate]);

    const handleCreateUser = async (userData: CreateUserData) => {
        setError('');
        setSuccess('');
        setCreating(true);

        try {
            const result = await userService.createUser(userData);

            if (result.success) {
                setSuccess(`User ${result.user?.firstName} ${result.user?.lastName} created successfully!`);

                // Optionally redirect to user list or reset form
                setTimeout(() => {
                    setSuccess('');
                }, 5000);
            } else {
                setError(result.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Create user error:', error);
            setError('An unexpected error occurred');
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/admin-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/admin-login', { replace: true });
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Create New User"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <div className="card">
                    {/* Back to Dashboard */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="btn btn-secondary"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    <h2 className="mb-6">Create New User</h2>

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success mb-6">
                            {success}
                        </div>
                    )}

                    {/* Create User Form */}
                    <CreateUserForm
                        onSubmit={handleCreateUser}
                        loading={creating}
                        error={error}
                    />
                </div>
            </main>
        </div>
    );
}