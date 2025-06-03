import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import type { User } from '../../services/auth';
import { companyService, } from '../../services/companies';
import type { Company } from '../../services/companies';

export default function EmployeeDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserAndCompany = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);

                if (!userData) {
                    navigate('/employee-login', { replace: true });
                    return;
                }

                if (userData.role !== 'employee') {
                    navigate('/employee-login', { replace: true });
                    return;
                }
                if (userData.companyId) {
                    try {
                        const companyResponse = await companyService.getCompanyById(userData.companyId);
                        setCompany(companyResponse.data.company);
                    } catch (error) {
                        console.error('Failed to fetch company:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/employee-login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndCompany();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/employee-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/employee-login', { replace: true });
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Employee Portal"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="space-y-6">
                    {/* Hero Card */}
                    <div className="card">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Welcome back, {user?.firstName}
                                </h1>
                                <p className="text-lg text-gray-600 mb-6">
                                    Employee Portal
                                </p>

                                {/* User Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                                        <div className="text-gray-900">{user?.email}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 mb-1">Role</div>
                                        <div className="text-gray-900">Employee</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 mb-1">Company</div>
                                        <div className="text-gray-900">
                                            {company?.name || (user?.companyId ? `Company ID: ${user.companyId}` : 'No Company Assigned')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Avatar Section */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.firstName}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <span className="text-white text-xl font-bold">
                                            {user?.firstName?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*Quick Actions for Employee */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/*View Company - Direct to company details */}
                            {user?.companyId && (
                                <Link
                                    to={`/employee/company/${user.companyId}`}
                                    className="group block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">View My Company</h3>
                                            <p className="text-sm text-gray-600">View company details and team members</p>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}