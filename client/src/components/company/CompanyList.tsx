import { useState, useEffect } from 'react';
import { CompanyCard } from './CompanyCard';
import { companyService, type Company } from '../../services/companies';

interface CompanyListProps {
    userRole: 'super_admin' | 'manager' | 'employee';
    onError?: (error: string) => void;
}

export function CompanyList({ userRole, onError }: CompanyListProps) {
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
        const result = await companyService.deleteCompany(companyId);
        if (result.success) {
            fetchCompanies(pagination.currentPage, searchTerm);
        } else {
            onError?.(result.message || 'Failed to delete company');
        }
        setDeletingId(null);
    };

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search companies by name, email, or website..."
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    {searchTerm && (
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <button
                                onClick={clearSearch}
                                className="mr-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                                title="Clear search"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Search Stats */}
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                        <span>
                            {companies.length > 0
                                ? `Found ${pagination.totalCompanies} compan${pagination.totalCompanies !== 1 ? 'ies' : 'y'} matching "${searchTerm}"`
                                : `No companies found matching "${searchTerm}"`
                            }
                        </span>
                        {companies.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {pagination.totalCompanies} result{pagination.totalCompanies !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
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

                                {/* page numbers */}
                                {[...Array(pagination.totalPages)].map((_, index) => {
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