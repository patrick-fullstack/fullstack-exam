import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { companyService, type Company } from '../../services/companies';
import { Header } from '../../components/layout/Header';
import { CompanyDetails } from '../../components/company/CompanyDetails';

export default function ManagerCompanyDetailPage() {
    const [user, setUser] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { companyId } = useParams<{ companyId: string }>();

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

    // Fetch company details
    useEffect(() => {
        const fetchCompany = async () => {
            if (!user || !companyId) return;

            setLoading(true);
            setError('');

            try {
                const response = await companyService.getCompanyById(companyId);
                setCompany(response.data.company);
            } catch (error) {
                console.error('Failed to fetch company:', error);
                setError(error instanceof Error ? error.message : 'Failed to load company');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [user, companyId]);

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
                title={company ? `${company.name} - Details` : "Company Details"}
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user.avatar}
                userName={user.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                {/* Loading State */}
                {/* Back Button */}
                <div className="mb-4">
                    <Link
                        to="/manager/companies"
                        className="btn btn-secondary"
                    >
                        ← Back to Companies
                    </Link>
                </div>
                {loading && (
                    <CompanyDetails
                        company={{} as Company}
                        companyId={companyId || ''}
                        loading={true}
                    />
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="space-y-6">
                        <div>
                            <Link
                                to="/manager/companies"
                                className="btn btn-secondary"
                            >
                                ← Back to Companies
                            </Link>
                        </div>
                        <div className="card">
                            <div className="text-center py-12">
                                <div className="text-red-500 text-lg mb-4">Error</div>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <Link to="/manager/companies" className="btn btn-primary">
                                    Back to Companies
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Company Not Found */}
                {!company && !loading && !error && (
                    <div className="space-y-6">
                        <div>
                            <Link
                                to="/manager/companies"
                                className="btn btn-secondary"
                            >
                                ← Back to Companies
                            </Link>
                        </div>
                        <div className="card">
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-4">Company not found</div>
                                <Link to="/manager/companies" className="btn btn-primary">
                                    Back to Companies
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {company && !loading && !error && (
                    <CompanyDetails
                        company={company}
                        loading={false}
                        companyId={companyId || ''}
                    />
                )}
            </main>
        </div>
    );
}