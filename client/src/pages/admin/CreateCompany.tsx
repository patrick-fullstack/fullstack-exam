import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { companyService, type CreateCompanyData } from '../../services/companies';
import { Header } from '../../components/layout/Header';
import { CompanyForm } from '../../components/company/CompanyForm';

export default function CreateCompanyPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
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

                // Only super admins can create companies
                if (userData.role !== 'super_admin') {
                    navigate('/admin/companies', { replace: true });
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

    // Handle create company
    const handleCreateCompany = async (companyData: CreateCompanyData) => {
        setCreating(true);
        setError('');

        try {
            await companyService.createCompany(companyData);

            // Redirect to companies list
            navigate('/admin/companies', { replace: true });
        } catch (error) {
            console.error('Failed to create company:', error);
            setError(error instanceof Error ? error.message : 'Failed to create company');
        } finally {
            setCreating(false);
        }
    };

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
                title="Create Company"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user.avatar}
                userName={user.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
                <div className="card">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            to="/admin/companies"
                            className="btn btn-secondary"
                        >
                            ← Back to Companies
                        </Link>
                    </div>

                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Company</h1>
                        <p className="text-gray-600">Add a new company to the system</p>
                    </div>

                    {/* Create Company Form */}
                    <CompanyForm
                        onSubmit={handleCreateCompany}
                        loading={creating}
                        error={error}
                        mode="create"
                    />
                </div>
            </main>
        </div>
    );
}