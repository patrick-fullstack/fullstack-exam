import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { companyService, type CreateCompanyData } from '../../services/companies';
import { Header } from '../../components/layout/Header';
import { CompanyForm } from '../../components/forms/CompanyForm';

export default function CreateCompanyPage() {
    const { user, logout } = useAuth();
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateCompany = async (companyData: CreateCompanyData) => {
        setCreating(true);
        setError('');

        try {
            await companyService.createCompany(companyData);
            navigate('/admin/companies', { replace: true });
        } catch (error) {
            console.error('Failed to create company:', error);
            setError(error instanceof Error ? error.message : 'Failed to create company');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title="Create Company"
                variant="dashboard"
                onLogout={logout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
                <div className="card">
                    <div className="mb-6">
                        <Link to="/admin/companies" className="btn btn-secondary">
                            ← Back to Companies
                        </Link>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Company</h1>
                        <p className="text-gray-600">Add a new company to the system</p>
                    </div>

                    <CompanyForm
                        onSubmit={handleCreateCompany}
                        loading={creating}
                        error={error}
                        mode="create"
                    />
                </div>
            </main>
        </div>
    );
}