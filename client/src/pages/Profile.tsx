import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, type User, type UpdateProfileRequest } from '../services/auth';
import { Header } from '../components/layout/Header';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AvatarUpload } from '../components/ui/AvatarUpload';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                if (userData) {
                    setUser(userData);
                    setFormData({
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        phone: userData.phone || '',
                        email: userData.email || '',
                        password: '',
                        confirmPassword: ''
                    });
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match if password is being changed
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setUpdating(true);

        try {
            if (!user) return;

            const updateData: UpdateProfileRequest = {};

            // Only include changed fields
            if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
            if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
            if (formData.phone !== user.phone) updateData.phone = formData.phone;
            if (formData.email !== user.email) updateData.email = formData.email;
            if (formData.password) updateData.password = formData.password;
            if (avatarFile) updateData.avatar = avatarFile;

            // Check if there are any changes
            if (Object.keys(updateData).length === 0) {
                setError('No changes to save');
                return;
            }

            const result = await auth.updateProfile(user.id, updateData);

            if (result.success) {
                setSuccess('Profile updated successfully!');
                setUser(result.user);
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));
                setAvatarFile(null);
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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="👤 Profile Settings"
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
                            onClick={() => navigate(getDashboardRoute())}
                            className="btn btn-secondary"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    <h2 className="mb-6">Profile Information</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="text-center pb-6 border-b border-gray-200">
                            <h3 className="mb-4">Profile Picture</h3>
                            <AvatarUpload
                                currentAvatar={user?.avatar}
                                onAvatarChange={setAvatarFile}
                                disabled={updating}
                            />
                        </div>

                        {/* Alert Messages */}
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {success}
                            </div>
                        )}

                        {/* Personal Information */}
                        <div>
                            <h3 className="mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                    required
                                />

                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                    required
                                />

                                <Input
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                />
                            </div>
                        </div>

                        {/* Account Information (Read Only) */}
                        <div>
                            <h3 className="mb-4">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.role?.replace('_', ' ') || ''}
                                        disabled
                                        className="input-field bg-gray-50"
                                    />
                                </div>

                                {user?.companyId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Company ID
                                        </label>
                                        <input
                                            type="text"
                                            value={user.companyId}
                                            disabled
                                            className="input-field bg-gray-50"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password Change */}
                        <div>
                            <h3 className="mb-4">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="New Password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                    placeholder="Leave blank to keep current password"
                                />

                                <Input
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={updating}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(getDashboardRoute())}
                                className="btn btn-secondary"
                                disabled={updating}
                            >
                                Cancel
                            </button>

                            <Button
                                type="submit"
                                loading={updating}
                                disabled={updating}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}