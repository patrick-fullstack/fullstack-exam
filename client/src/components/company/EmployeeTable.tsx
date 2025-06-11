import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companies';
import { userService } from '../../services/users';
import type { CompanyEmployee, EmployeeTableProps } from '../../types/companies';

export function EmployeeTable({
    companyId,
    currentUserRole,
    currentUserId,
    onError,
    onSuccess
}: EmployeeTableProps) {
    const navigate = useNavigate();

    // State management using CompanyEmployee from companies.ts
    const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

    // Pagination state with explicit typing
    const [pagination, setPagination] = useState<{
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        usersPerPage: number;
    }>({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNextPage: false,
        hasPrevPage: false,
        usersPerPage: 10
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch employees from backend
    const fetchEmployees = async (page = 1, search = debouncedSearchTerm): Promise<void> => {
        setLoading(true);
        try {
            const response = await companyService.getCompanyById(companyId, {
                userPage: page,
                userLimit: 10,
                userSearch: search || undefined
            });

            if (response.success && response.data) {
                // Set employees from the response - already typed as CompanyEmployee[]
                const companyUsers = response.data.company.users || [];
                setEmployees(companyUsers);

                // Set pagination from response or create fallback
                if (response.data.userPagination) {
                    setPagination(response.data.userPagination);
                } else {
                    // Fallback pagination if backend doesn't return userPagination
                    setPagination({
                        currentPage: page,
                        totalPages: 1,
                        totalUsers: companyUsers.length,
                        hasNextPage: false,
                        hasPrevPage: false,
                        usersPerPage: 10
                    });
                }
            } else {
                onError?.('Failed to load employees');
                setEmployees([]);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            onError?.('Failed to load employees');
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (companyId) {
            fetchEmployees();
        }
    }, [companyId]);

    // Trigger search when debounced search term changes
    useEffect(() => {
        if (companyId) {
            fetchEmployees(1, debouncedSearchTerm); // Reset to page 1 when searching
        }
    }, [debouncedSearchTerm, companyId]);

    // Handle search input change - just update the search term, debouncing will handle the actual search
    const handleSearch = (value: string): void => {
        setSearchTerm(value);
    };

    // Clear search - exactly like CompanyList
    const clearSearch = (): void => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
    };

    // Handle page change
    const handlePageChange = (page: number): void => {
        fetchEmployees(page, debouncedSearchTerm);
    };

    // Handle delete with refresh
    const handleDeleteUser = async (e: React.MouseEvent, userId: string): Promise<void> => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        setDeletingId(userId);
        try {
            const result = await userService.deleteUser(userId);
            if (result.success) {
                onSuccess?.('User deleted successfully');
                // Refresh current page after delete
                fetchEmployees(pagination.currentPage, debouncedSearchTerm);
            } else {
                onError?.(result.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            onError?.('Failed to delete user');
        } finally {
            setDeletingId(null);
        }
    };

    // Handle row click
    const handleRowClick = (userId: string): void => {
        navigate(`/profile/${userId}`);
    };

    // Handle edit click
    const handleEditClick = (e: React.MouseEvent, userId: string): void => {
        e.stopPropagation();
        navigate(`/profile/${userId}?edit=true`);
    };

    // Permission checks
    const canEdit = (): boolean => {
        return currentUserRole === 'super_admin' || currentUserRole === 'manager';
    };

    const canDelete = (employee: CompanyEmployee): boolean => {
        return currentUserRole === 'super_admin' && employee.id !== currentUserId;
    };

    // Don't render if no companyId
    if (!companyId) {
        return (
            <div className="card">
                <div className="text-center py-8 text-gray-500">
                    No company selected
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">
                    Company Employees ({pagination.totalUsers})
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Click on any employee to view their profile
                </p>
            </div>

            {/* Search Bar - Exactly like CompanyList */}
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
                        placeholder="Search employees by name or email..."
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors"
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
                            {employees.length > 0
                                ? `Found ${pagination.totalUsers} employee${pagination.totalUsers !== 1 ? 's' : ''} matching "${searchTerm}"`
                                : `No employees found matching "${searchTerm}"`
                            }
                        </span>
                        {employees.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {pagination.totalUsers} result{pagination.totalUsers !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="text-gray-500 mt-2">Loading employees...</p>
                </div>
            )}

            {/* No Employees */}
            {!loading && employees.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No employees found</div>
                    <p className="text-gray-400">
                        {searchTerm
                            ? 'No employees match your search criteria'
                            : 'This company doesn\'t have any employees yet'
                        }
                    </p>
                </div>
            )}

            {/* Employees Table */}
            {!loading && employees.length > 0 && (
                <>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                    {employees.some(emp => canEdit() || canDelete(emp)) && (
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee, index) => (
                                    <tr
                                        key={employee.id}
                                        onClick={() => handleRowClick(employee.id)}
                                        style={{
                                            borderBottom: index < employees.length - 1 ? '1px solid var(--border-color)' : 'none'
                                        }}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        title="Click to view profile"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {employee.avatar ? (
                                                        <img
                                                            src={employee.avatar}
                                                            alt={`${employee.firstName} ${employee.lastName}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {employee.firstName} {employee.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <div className="text-gray-600">{employee.email}</div>
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {employee.role === 'manager' ? 'Manager' : 'Employee'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {employees.some(emp => canEdit() || canDelete(emp)) && (
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2">
                                                    {canEdit() && (
                                                        <button
                                                            onClick={(e) => handleEditClick(e, employee.id)}
                                                            className="btn btn-sm btn-secondary"
                                                            title="Edit Employee"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {canDelete(employee) && (
                                                        <button
                                                            onClick={(e) => handleDeleteUser(e, employee.id)}
                                                            disabled={deletingId === employee.id}
                                                            className="btn btn-sm btn-error"
                                                            title="Delete Employee"
                                                        >
                                                            {deletingId === employee.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Made consistent with CompanyList */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t pt-6">
                            {/* Results info */}
                            <div className="text-sm text-gray-700">
                                Showing {((pagination.currentPage - 1) * pagination.usersPerPage) + 1} to{' '}
                                {Math.min(pagination.currentPage * pagination.usersPerPage, pagination.totalUsers)} of{' '}
                                {pagination.totalUsers} employees
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

                                {/* Page numbers */}
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