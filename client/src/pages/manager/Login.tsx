import { useState } from 'react';
import { Link } from 'react-router-dom';
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

            if (result.success && result.user) { // Added type guard
                // Check if user is actually a manager
                if (result.user.role !== 'manager') {
                    setError(`Access denied. You are a ${result.user.role.replace('_', ' ')}. This is the Manager portal.`);
                    auth.logout(); // Clear stored credentials
                    return;
                }
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

                {/* Navigation - Using Link components instead of <a> tags */}
                <div className="mt-4 text-center">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                        Not a manager?
                        <Link to="/admin-login" style={{ color: 'var(--primary-green)', marginLeft: '0.25rem' }}>Admin Login</Link> |
                        <Link to="/employee-login" style={{ color: 'var(--primary-green)', marginLeft: '0.25rem' }}>Employee Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}