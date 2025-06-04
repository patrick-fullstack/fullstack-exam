import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService, type CompanyEmployee } from '../../services/companies';
import { userService } from '../../services/users';

interface EmployeeTableProps {
    companyId: string;
    currentUserRole: 'super_admin' | 'manager' | 'employee';
    currentUserId?: string;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}

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

    // Fetch employees from backend
    const fetchEmployees = async (page = 1, search = searchTerm): Promise<void> => {
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

    // Handle search
    const handleSearch = (value: string): void => {
        setSearchTerm(value);
        fetchEmployees(1, value); // Reset to page 1 when searching
    };

    // Clear search
    const clearSearch = (): void => {
        setSearchTerm('');
        fetchEmployees(1, '');
    };

    // Handle page change
    const handlePageChange = (page: number): void => {
        fetchEmployees(page, searchTerm);
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
                fetchEmployees(pagination.currentPage, searchTerm);
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

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search employees by name or email..."
                        className="input w-full"
                        disabled={loading}
                    />
                </div>
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Clear
                    </button>
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

                    {/* Pagination */}
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
                                    disabled={!pagination.hasPrevPage || loading}
                                    className="btn btn-secondary"
                                >
                                    Previous
                                </button>

                                {/* Page numbers (max 5) */}
                                {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                                    const startPage = Math.max(1, pagination.currentPage - 2);
                                    const page = startPage + index;

                                    if (page > pagination.totalPages) return null;

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
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
                                    disabled={!pagination.hasNextPage || loading}
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