import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import { EmailList } from '../../components/email/EmailList';

export default function EmailManagementPage() {
    const { user, logout } = useAuth();
    const [error, setError] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const clearError = () => {
        setError('');
    };

    const refreshEmails = () => {
        setRefreshTrigger(prev => prev + 1);
        clearError();
    };

    const getDashboardPath = () => {
        if (user?.role === 'super_admin') return '/admin-dashboard';
        if (user?.role === 'manager') return '/manager-dashboard';
        return '/admin-dashboard';
    };

    const getCreateEmailPath = () => {
        if (user?.role === 'super_admin') return '/admin/emails/create';
        if (user?.role === 'manager') return '/manager/emails/create';
        return '/admin/emails/create';
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Email Management"
                variant="dashboard"
                onLogout={logout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
                                    <p className="text-gray-600">
                                        Manage your scheduled and sent emails
                                    </p>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {user?.role === 'super_admin' ? 'Super Admin' : 'Manager'} Dashboard
                            </div>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white shadow rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    to={getDashboardPath()}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Dashboard
                                </Link>

                                <button
                                    onClick={refreshEmails}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    title="Refresh emails"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>

                            <Link
                                to={getCreateEmailPath()}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Email
                            </Link>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={clearError}
                                    className="ml-4 text-red-400 hover:text-red-600"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email List */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Email History</h2>
                            <p className="text-sm text-gray-500">View and manage all your emails</p>
                        </div>

                        <div className="p-6">
                            <EmailList
                                onError={handleError}
                                refreshTrigger={refreshTrigger}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}