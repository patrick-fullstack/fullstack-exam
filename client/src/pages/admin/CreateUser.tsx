import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/users';
import { Header } from '../../components/layout/Header';
import { CreateUserForm, type CreateUserData } from '../../components/forms/CreateUserForm';

export default function CreateUserPage() {
    const { user, logout } = useAuth();
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resetForm, setResetForm] = useState(false);
    const navigate = useNavigate();

    const handleCreateUser = async (userData: CreateUserData) => {
        setMessage({ type: '', text: '' });
        setCreating(true);
        setResetForm(false);

        const result = await userService.createUser(userData);

        if (result.success) {
            setMessage({
                type: 'success',
                text: `User ${result.user?.firstName} ${result.user?.lastName} created successfully!`
            });
            setResetForm(true);

            // Clear message after 5 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setResetForm(false);
            }, 5000);
        } else {
            setMessage({
                type: 'error',
                text: result.error || 'Failed to create user'
            });
        }

        setCreating(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            <Header
                title="Create New User"
                variant="dashboard"
                onLogout={logout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            <main className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
                <div className="card">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="btn btn-secondary"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New User</h2>
                        <p className="text-gray-600">
                            Add a new user to the system with appropriate role and permissions
                        </p>
                    </div>

                    {/* Single Message Display */}
                    {message.text && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                            {message.text}
                        </div>
                    )}

                    <CreateUserForm
                        onSubmit={handleCreateUser}
                        loading={creating}
                        error={message.type === 'error' ? message.text : ''}
                        resetForm={resetForm}
                    />
                </div>
            </main>
        </div>
    );
}