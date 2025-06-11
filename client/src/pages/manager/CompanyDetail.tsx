import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { companyService } from '../../services/companies';
import { Header } from '../../components/layout/Header';
import { CompanyDetails } from '../../components/company/CompanyDetails';
import type { Company } from '../../types/companies';

export default function ManagerCompanyDetailPage() {
    const { user, logout } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { companyId } = useParams<{ companyId: string }>();

    // Fetch company details
    useEffect(() => {
        const fetchCompany = async () => {
            if (!user || !companyId) return;

            setLoading(true);
            setError('');

            try {
                const response = await companyService.getCompanyById(companyId);
                setCompany(response.data.company);
            } catch (error) {
                console.error('Failed to fetch company:', error);
                setError(error instanceof Error ? error.message : 'Failed to load company');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [user, companyId]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            {/* Header */}
            <Header
                title={company ? `${company.name} - Details` : "Company Details"}
                variant="dashboard"
                onLogout={logout}
                userAvatar={user?.avatar}
                userName={user?.firstName}
            />

            {/* Content */}
            <main className="container" style={{ paddingTop: '2rem' }}>
                {/* Back Button */}
                <div className="mb-4">
                    <Link to="/manager/companies" className="btn btn-secondary">
                        ← Back to Companies
                    </Link>
                </div>

                {/* Loading State */}
                {loading && <div className="text-center py-8">Loading company details...</div>}

                {/* Error State */}
                {error && !loading && (
                    <div className="card text-center py-12">
                        <div className="text-red-500 text-lg mb-4">Error</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Link to="/manager/companies" className="btn btn-primary">
                            Back to Companies
                        </Link>
                    </div>
                )}

                {/* Company Not Found */}
                {!company && !loading && !error && (
                    <div className="card text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">Company not found</div>
                        <Link to="/manager/companies" className="btn btn-primary">
                            Back to Companies
                        </Link>
                    </div>
                )}

                {/* Success State */}
                {company && !loading && !error && (
                    <CompanyDetails
                        company={company}
                        loading={false}
                        companyId={companyId || ''}
                        currentUser={user || undefined}
                        onUpdate={(updatedCompany) => setCompany(updatedCompany)}
                    />
                )}
            </main>
        </div>
    );
}