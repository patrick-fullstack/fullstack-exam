import { useState } from 'react';
import { CompanyCard } from './CompanyCard';
import type { Company } from '../../services/companies';

interface CompanyListProps {
    companies: Company[];
    onDelete?: (companyId: string) => void;
    loading?: boolean;
    userRole: 'super_admin' | 'manager' | 'employee';
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalCompanies: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        companiesPerPage: number;
    };
    onPageChange?: (page: number) => void;
}

export function CompanyList({
    companies,
    onDelete,
    loading,
    userRole,
    pagination,
    onPageChange
}: CompanyListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (companyId: string) => {
        setDeletingId(companyId);
        try {
            await onDelete?.(companyId);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="card animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No companies found</div>
                <p className="text-gray-400">
                    {userRole === 'super_admin'
                        ? 'Create your first company to get started'
                        : 'No companies available'}
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {companies.map((company) => (
                    <CompanyCard
                        key={company.id}
                        company={company}
                        onDelete={userRole === 'super_admin' ? handleDelete : undefined}
                        isDeleting={deletingId === company.id}
                        userRole={userRole}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-6">
                    {/* Results info */}
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.currentPage - 1) * pagination.companiesPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.companiesPerPage, pagination.totalCompanies)} of{' '}
                        {pagination.totalCompanies} companies
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="btn btn-secondary"
                        >
                            Previous
                        </button>

                        {/* page numbers (max 5) */}
                        {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                            const page = index + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange?.(page)}
                                    className={`btn ${page === pagination.currentPage
                                        ? 'btn-primary'
                                        : 'btn-secondary'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className="btn btn-secondary"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}