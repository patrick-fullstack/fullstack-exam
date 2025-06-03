import { Link } from 'react-router-dom';
import type { Company } from '../../services/companies';

interface CompanyCardProps {
    company: Company;
    onDelete?: (companyId: string) => void;
    isDeleting?: boolean;
    userRole: 'super_admin' | 'manager' | 'employee';
}

export function CompanyCard({ company, onDelete, isDeleting, userRole }: CompanyCardProps) {
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${company.name}? This action cannot be undone.`)) {
            onDelete?.(company.id);
        }
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            {/* Company Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {/* Company Logo */}
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt={`${company.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-gray-500">
                                {company.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Company Info */}
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.email}</p>
                    </div>
                </div>

                {/* Actions for Super Admin */}
                {userRole === 'super_admin' && onDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                        title="Delete Company"
                    >
                        {isDeleting ? '...' : '🗑️'}
                    </button>
                )}
            </div>

            {/* Company Details */}
            <div className="space-y-3 mb-4">
                <div>
                    <span className="text-sm font-medium text-gray-700">Website:</span>
                    <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 ml-2 break-all"
                    >
                        {company.website}
                    </a>
                </div>

                {company.users && (
                    <div>
                        <span className="text-sm font-medium text-gray-700">Employees:</span>
                        <span className="text-sm text-gray-600 ml-2">
                            {company.users.length} {company.users.length === 1 ? 'employee' : 'employees'}
                        </span>
                    </div>
                )}

                <div>
                    <span className="text-sm font-medium text-gray-700">Created:</span>
                    <span className="text-sm text-gray-600 ml-2">
                        {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* View Details Button */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <Link
                    to={`/admin/companies/${company.id}`}
                    className="btn btn-primary w-full"
                >
                    View Details & Employees
                </Link>
            </div>
        </div>
    );
}