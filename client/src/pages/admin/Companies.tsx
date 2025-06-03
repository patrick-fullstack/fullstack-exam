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

export default function CompaniesPage() {
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

    // Handle delete company
    const handleDeleteCompany = async (companyId: string) => {
        try {
            await companyService.deleteCompany(companyId);

            // Refresh companies list
            await fetchCompanies(currentPage, searchTerm);

            // Show success message
            setError(''); // Clear any existing errors
        } catch (error) {
            console.error('Failed to delete company:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete company');
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

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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
                        onDelete={user.role === 'super_admin' ? handleDeleteCompany : undefined}
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