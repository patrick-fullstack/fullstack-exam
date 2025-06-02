import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import type { User } from '../../services/auth';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);

                // If no user data, redirect to login using React Router
                if (!userData) {
                    navigate('/admin-login', { replace: true });
                    return;
                }

                // Check if user is actually a super admin
                if (userData.role !== 'super_admin') {
                    navigate('/admin-login', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/admin-login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await auth.logout();
            // Use React Router navigation instead of window.location.href
            navigate('/admin-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/admin-login', { replace: true });
        }
    };

    // Show loading while fetching user
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
                title="Super Admin Dashboard"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="card">
                    <h2>Welcome back, {user?.firstName}! 👑</h2>
                    <div className="mt-4" style={{ color: 'var(--text-gray)' }}>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Role:</strong> Super Administrator</p>
                        <p><strong>Access Level:</strong> Full System Access</p>
                    </div>
                    <div className="mt-6">
                        <h3 style={{ marginBottom: '1rem' }}>Admin Features:</h3>
                        <ul style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                            <li>• Manage all users and companies</li>
                            <li>• Create managers and employees</li>
                            <li>• System-wide settings and reports</li>
                            <li>• Complete access to all data</li>
                        </ul>
                    </div>
                    {/* Quick Actions */}
                    <div className="mt-8">
                        <h3 className="mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Create User Card */}
                            <Link
                                to="/admin/create-user"
                                className="block p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl"></span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Create User</h4>
                                        <p className="text-sm text-gray-500">Add new managers or employees</p>
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