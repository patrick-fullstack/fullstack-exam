import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, type User } from '../../services/auth';
import { companyService, type Company } from '../../services/companies';
import { Header } from '../../components/layout/Header';
import { CompanyList } from '../../components/company/CompanyList';

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCompanies: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    companiesPerPage: number;
}

export default function ManagerCompaniesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationData | undefined>(undefined);
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

                // ✅ Only allow managers
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

    // Fetch companies
    const fetchCompanies = async (page = 1, search = '') => {
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const response = await companyService.getCompanies({
                page,
                limit: 9,
                search: search.trim() || undefined,
            });

            setCompanies(response.data.companies);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            setError(error instanceof Error ? error.message : 'Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    // Fetch companies when user or page changes
    useEffect(() => {
        if (user) {
            fetchCompanies(currentPage, searchTerm);
        }
    }, [user, currentPage]);

    // Handle search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        await fetchCompanies(1, searchTerm);
    };

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

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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

                    {/* Search Bar */}
                    <div className="card">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search companies by name, email, or website..."
                                    className="input w-full"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Search
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCurrentPage(1);
                                        fetchCompanies(1, '');
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Companies List */}
                    <CompanyList
                        companies={companies}
                        onDelete={undefined} // ✅ No delete access for managers
                        loading={loading}
                        userRole={user.role as 'super_admin' | 'manager' | 'employee'}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                    />
                </div>
            </main>
        </div>
    );
}