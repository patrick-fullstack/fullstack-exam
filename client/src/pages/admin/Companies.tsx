import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import { CompanyList } from '../../components/company/CompanyList';

export default function CompaniesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);

                if (!userData) {
                    navigate('/admin-login', { replace: true });
                    return;
                }

                if (userData.role !== 'super_admin' && userData.role !== 'manager') {
                    navigate('/admin-login', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/admin-login', { replace: true });
            }
        };

        fetchUser();
    }, [navigate]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/admin-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/admin-login', { replace: true });
        }
    };

    if (!user) {
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
                title="Company Management"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user.avatar}
                userName={user.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
                            <p className="text-gray-600">
                                {user.role === 'super_admin'
                                    ? 'Manage all companies in the system'
                                    : 'View your company information'
                                }
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <Link
                                to="/admin-dashboard"
                                className="btn btn-secondary"
                            >
                                ← Back to Dashboard
                            </Link>

                            {user.role === 'super_admin' && (
                                <Link
                                    to="/admin/companies/create"
                                    className="btn btn-primary"
                                >
                                    Create Company
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Companies List*/}
                    <CompanyList
                        userRole={user.role as 'super_admin' | 'manager' | 'employee'}
                        onError={setError}
                    />
                </div>
            </main>
        </div>
    );
}