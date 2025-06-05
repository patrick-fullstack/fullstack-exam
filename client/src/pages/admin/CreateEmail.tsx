import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import { emailService } from '../../services/email';
import { Header } from '../../components/layout/Header';
import { EmailForm } from '../../components/forms/EmailForm';
import type { User } from '../../services/auth';
import type { CreateEmailData } from '../../services/email';

export default function CreateEmailPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetForm, setResetForm] = useState(false);
    const navigate = useNavigate();

    // Check authentication and permissions
    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const userData = await auth.getCurrentUser();

                if (!userData) {
                    navigate('/admin-login', { replace: true });
                    return;
                }

                // Only super admins and managers can access this page
                if (userData.role !== 'super_admin' && userData.role !== 'manager') {
                    navigate('/admin-dashboard', { replace: true });
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error('Failed to check permissions:', error);
                navigate('/admin-login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkPermissions();
    }, [navigate]);

    const handleCreateEmail = async (emailData: CreateEmailData) => {
        setError('');
        setSuccess('');
        setCreating(true);
        setResetForm(false);

        try {
            const result = await emailService.createEmail(emailData);

            if (result.success) {
                setSuccess(
                    emailData.sendNow
                        ? 'Email sent successfully!'
                        : `Email scheduled successfully for ${new Date(emailData.scheduledFor!).toLocaleString()}!`
                );
                setResetForm(true);

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccess('');
                    setResetForm(false);
                }, 5000);
            } else {
                setError(result.error || 'Failed to create email');
            }
        } catch (error) {
            console.error('Create email error:', error);
            setError('An unexpected error occurred');
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/admin-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/admin-login', { replace: true });
        }
    };

    const getDashboardPath = () => {
        if (user?.role === 'super_admin') return '/admin-dashboard';
        if (user?.role === 'manager') return '/manager-dashboard';
        return '/admin-dashboard';
    };

    const getEmailManagementPath = () => {
        if (user?.role === 'super_admin') return '/admin/emails';
        if (user?.role === 'manager') return '/manager/emails';
        return '/admin/emails';
    };

    if (loading) {
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
                title="Create Email"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem', maxWidth: '900px' }}>
                <div className="space-y-6">
                    {/* Navigation */}
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate(getDashboardPath())}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ← Back to Dashboard
                        </button>

                        <button
                            onClick={() => navigate(getEmailManagementPath())}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            📧 View All Emails
                        </button>
                    </div>

                    {/* Page Header */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Create Email</h1>
                                <p className="text-gray-600">
                                    Send an email immediately or schedule it for later
                                </p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user?.role === 'super_admin' ? 'Super Admin' : 'Manager'} Access
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {success}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Form */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <EmailForm
                            onSubmit={handleCreateEmail}
                            loading={creating}
                            error={error}
                            resetForm={resetForm}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}