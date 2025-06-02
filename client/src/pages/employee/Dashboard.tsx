import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/auth';
import { Header } from '../../components/layout/Header';
import type { User } from '../../services/auth';

export default function EmployeeDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await auth.getCurrentUser();
                setUser(userData);

                // If no user data, redirect to login using React Router
                if (!userData) {
                    navigate('/employee-login', { replace: true });
                    return;
                }

                // Check if user is actually an employee
                if (userData.role !== 'employee') {
                    navigate('/employee-login', { replace: true });
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                navigate('/employee-login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await auth.logout();
            // Use React Router navigation instead of window.location.href
            navigate('/employee-login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/employee-login', { replace: true });
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
                title="Employee Portal"
                variant="dashboard"
                onLogout={handleLogout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
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