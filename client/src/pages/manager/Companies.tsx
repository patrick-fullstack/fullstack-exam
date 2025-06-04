import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import { CompanyList } from '../../components/company/CompanyList';

export default function ManagerCompaniesPage() {
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
                    navigate('/manager-login', { replace: true });
                    return;
                }

                // Only allow managers
                if (userData.role !== 'manager') {
                    navigate('/manager-login', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/manager-login', { replace: true });
            }
        };

        fetchUser();
    }, [navigate]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/manager-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/manager-login', { replace: true });
        }
    };

    if (!user) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Company Directory"
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
                            <h1 className="text-2xl font-bold text-gray-900">Companies Directory</h1>
                            <p className="text-gray-600">
                                Browse all companies in the system
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <Link
                                to="/manager-dashboard"
                                className="btn btn-secondary"
                            >
                                ← Back to Dashboard
                            </Link>
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
                        onDelete={undefined}
                        userRole={user.role as 'super_admin' | 'manager' | 'employee'}
                        onError={setError}
                    />
                </div>
            </main>
        </div>
    );
}