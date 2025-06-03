import type { CompanyEmployee } from '../../services/companies';

interface EmployeeTableProps {
    employees: CompanyEmployee[];
    loading?: boolean;
}

export function EmployeeTable({ employees, loading }: EmployeeTableProps) {
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
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => (
                            <tr
                                key={employee.id}
                                style={{
                                    borderBottom: index < employees.length - 1 ? '1px solid var(--border-color)' : 'none'
                                }}
                                className="hover:bg-gray-50 transition-colors"
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}