import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CompanyEmployee } from '../../services/companies';
import { userService } from '../../services/users';

interface EmployeeTableProps {
    employees: CompanyEmployee[];
    loading?: boolean;
    currentUserRole: 'super_admin' | 'manager' | 'employee';
    currentUserId?: string;
    currentUserCompanyId?: string;
    onRefresh?: () => void;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}

export function EmployeeTable({
    employees,
    loading,
    currentUserRole,
    currentUserId,
    onRefresh,
    onError,
    onSuccess
}: EmployeeTableProps) {
    const navigate = useNavigate();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Handle row click - Navigate to profile view
    const handleRowClick = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    // Handle edit click - Navigate to profile edit
    const handleEditClick = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        navigate(`/profile/${userId}?edit=true`);
    };

    // Handle delete employee
    const handleDeleteEmployee = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        setDeletingId(userId);

        try {
            const result = await userService.deleteUser(userId);

            if (result.success) {
                onSuccess?.('Employee deleted successfully');
                onRefresh?.();
            } else {
                onError?.(result.error || 'Failed to delete employee');
            }
        } catch (error) {
            console.error('Failed to delete employee:', error);
            onError?.('Failed to delete employee');
        } finally {
            setDeletingId(null);
        }
    };

    // Check permissions
    const canEdit = () => {
        return currentUserRole === 'super_admin' || currentUserRole === 'manager';
    };

    const canDelete = (employee: CompanyEmployee) => {
        return currentUserRole === 'super_admin' && employee.id !== currentUserId;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="text-center py-8">
                    <p>Loading employees...</p>
                </div>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No employees found</div>
                <p className="text-gray-400">
                    This company doesn't have any employees yet
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">
                    Company Employees ({employees.length})
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Click on any employee to view their profile
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                            {(currentUserRole === 'super_admin' || currentUserRole === 'manager') && (
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
                                {/* Employee Info */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-3">
                                        {/* Avatar */}
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

                                        {/* Name */}
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {employee.firstName} {employee.lastName}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="py-4 px-4">
                                    <div className="text-gray-600">{employee.email}</div>
                                </td>

                                {/* Role */}
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.role === 'manager'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {employee.role === 'manager' ? 'Manager' : 'Employee'}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {employee.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                {/* Actions */}
                                {(currentUserRole === 'super_admin' || currentUserRole === 'manager') && (
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            {/* Edit Button */}
                                            {canEdit() && (
                                                <button
                                                    onClick={(e) => handleEditClick(e, employee.id)}
                                                    className="btn btn-sm btn-secondary"
                                                    title="Edit Employee"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="hidden sm:inline ml-1">Edit</span>
                                                </button>
                                            )}

                                            {/* Delete Button - Super Admin only */}
                                            {canDelete(employee) && (
                                                <button
                                                    onClick={(e) => handleDeleteEmployee(e, employee.id)}
                                                    disabled={deletingId === employee.id}
                                                    className="btn btn-sm btn-error"
                                                    title="Delete Employee"
                                                >
                                                    {deletingId === employee.id ? (
                                                        <div className="loading loading-spinner loading-xs"></div>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span className="hidden sm:inline ml-1">Delete</span>
                                                        </>
                                                    )}
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
        </div>
    );
}