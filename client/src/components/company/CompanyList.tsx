import { useState, useEffect } from 'react';
import { CompanyCard } from './CompanyCard';
import { companyService, type Company } from '../../services/companies';

interface CompanyListProps {
    onDelete?: (companyId: string) => void;
    userRole: 'super_admin' | 'manager' | 'employee';
    onError?: (error: string) => void;
}

export function CompanyList({ onDelete, userRole, onError }: CompanyListProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCompanies: 0,
        hasNextPage: false,
        hasPrevPage: false,
        companiesPerPage: 6
    });

    // Fetch companies from backend
    const fetchCompanies = async (page = 1, search = searchTerm) => {
        setLoading(true);
        try {
            const response = await companyService.getCompanies({
                page,
                limit: 6,
                search: search || undefined
            });

            setCompanies(response.data.companies);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            onError?.('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchCompanies();
    }, []);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        fetchCompanies(1, value); // Reset to page 1 when searching
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        fetchCompanies(1, '');
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        fetchCompanies(page, searchTerm);
    };

    // Handle delete
    const handleDelete = async (companyId: string) => {
        setDeletingId(companyId);
        try {
            await onDelete?.(companyId);
            // Refresh current page after delete
            fetchCompanies(pagination.currentPage, searchTerm);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            {/* Search Bar */}
            <div className="card mb-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search companies by name, email, or website..."
                            className="input w-full"
                        />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="btn btn-secondary"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="card animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Companies */}
            {!loading && companies.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No companies found</div>
                    <p className="text-gray-400">
                        {searchTerm
                            ? 'Try adjusting your search criteria'
                            : userRole === 'super_admin'
                                ? 'Create your first company to get started'
                                : 'No companies available'
                        }
                    </p>
                </div>
            )}

            {/* Companies Grid */}
            {!loading && companies.length > 0 && (
                <>
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
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                                            onClick={() => handlePageChange(page)}
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
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="btn btn-secondary"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}