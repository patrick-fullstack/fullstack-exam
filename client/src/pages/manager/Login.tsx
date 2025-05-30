import { useState } from 'react';
import { auth } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import { LoginForm } from '../../components/forms/LoginForm';

export default function ManagerLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (email: string, password: string) => {
        setError('');
        setLoading(true);

        try {
            const result = await auth.login(email, password);

            if (result.success) {
                // Check if user is actually a manager
                if (result.user.role !== 'manager') {
                    let roleMessage = '';
                    if (result.user.role === 'super_admin') {
                        roleMessage = 'You are a Super Admin. This is the Manager portal.';
                    } else if (result.user.role === 'employee') {
                        roleMessage = 'You are an Employee. This is the Manager portal.';
                    }

                    setError(`Access denied. ${roleMessage}`);
                    auth.logout(); // Clear stored credentials
                    return;
                }

                window.location.reload(); // Redirect to manager dashboard
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>

                {/* Header */}
                <Header
                    title="Manager Portal"
                    subtitle="Management Team Access"
                    variant="login"
                />

                {/* Login Form Component */}
                <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                    error={error}
                />

                {/* Navigation */}
                <div className="mt-4 text-center">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                        Not a manager?
                        <a href="/admin-login" style={{ color: 'var(--primary-green)', marginLeft: '0.25rem' }}>Admin Login</a> |
                        <a href="/employee-login" style={{ color: 'var(--primary-green)', marginLeft: '0.25rem' }}>Employee Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}