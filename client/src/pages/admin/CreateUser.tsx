import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/users';
import { Header } from '../../components/layout/Header';
import { CreateUserForm, type CreateUserData } from '../../components/forms/CreateUserForm';

export default function CreateUserPage() {
    const { user, logout } = useAuth();
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetForm, setResetForm] = useState(false);
    const navigate = useNavigate();

    const handleCreateUser = async (userData: CreateUserData) => {
        setError('');
        setSuccess('');
        setCreating(true);
        setResetForm(false);

        const result = await userService.createUser(userData);

        if (result.success) {
            setSuccess(`User ${result.user?.firstName} ${result.user?.lastName} created successfully!`);
            setResetForm(true);

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccess('');
                setResetForm(false);
            }, 5000);
        } else {
            setError(result.error || 'Failed to create user');
        }

        setCreating(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Create New User"
                variant="dashboard"
                onLogout={logout}
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

                    {/* Page Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New User</h2>
                        <p className="text-gray-600">
                            Add a new user to the system with appropriate role and permissions
                        </p>

                        {/* Role Badge */}
                        {user?.role === 'super_admin' && (
                            <div className="mt-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Super Admin Access
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="alert alert-success mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

                    {/* Create User Form */}
                    <CreateUserForm
                        onSubmit={handleCreateUser}
                        loading={creating}
                        error={error}
                        resetForm={resetForm}
                    />
                </div>
            </main>
        </div>
    );
}