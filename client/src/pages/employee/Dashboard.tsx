import { useState, useEffect } from 'react';
import { auth } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import type { User } from '../../services/auth';

export default function EmployeeDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);

                // If no user data, redirect to login
                if (!userData) {
                    window.location.href = '/employee-login';
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                window.location.href = '/employee-login';
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.logout();
            window.location.href = '/employee-login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/employee-login';
        }
    };

    // Show loading while fetching user
    if (loading) {
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
                title="👨‍💻 Employee Portal"
                variant="dashboard"
                onLogout={handleLogout}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                <div className="card">
                    <h2>Welcome back, {user?.firstName}! 🚀</h2>
                    <div className="mt-4" style={{ color: 'var(--text-gray)' }}>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Role:</strong> Employee</p>
                        <p><strong>Company ID:</strong> {user?.companyId}</p>
                        <p><strong>Access Level:</strong> Employee Tasks</p>
                    </div>
                    <div className="mt-6">
                        <h3 style={{ marginBottom: '1rem' }}>Employee Features:</h3>
                        <ul style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                            <li>• View assigned tasks and projects</li>
                            <li>• Update task status and progress</li>
                            <li>• Access company resources</li>
                            <li>• Submit reports and timesheets</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}