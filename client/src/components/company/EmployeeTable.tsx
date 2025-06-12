import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { useAuth } from "../../contexts/AuthContext";
import type { EmployeeTableProps } from "../../types/companies";

export function EmployeeTable({
  companyId,
  onError,
  onSuccess,
}: EmployeeTableProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    employees,
    employeesLoading: loading,
    employeesPagination: pagination,
    employeesSearchTerm: searchTerm,
    deletingEmployeeId: deletingId,
    error,
    success,
    fetchEmployees,
    searchEmployees,
    clearEmployeesSearch,
    deleteEmployee,
  } = useCompany();

  // Forward context messages to parent callbacks
  useEffect(() => {
    if (error && onError) onError(error);
    if (success && onSuccess) onSuccess(success);
  }, [error, success, onError, onSuccess]);

  // Initial fetch when companyId changes
  useEffect(() => {
    if (companyId) {
      fetchEmployees(companyId);
    }
  }, [companyId, fetchEmployees]);

  // Handle search - use context method
  const handleSearch = (value: string) => {
    searchEmployees(value);
  };

  // Handle page change - use context method
  const handlePageChange = (page: number) => {
    fetchEmployees(companyId, page, searchTerm);
  };

  // Handle delete - use context method
  const handleDeleteUser = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteEmployee(userId);
  };

  // Handle row click
  const handleRowClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}?edit=true`);
  };

  // Permission checks using AuthContext user
  const canEdit = () => {
    return user && (user.role === "super_admin" || user.role === "manager");
  };

  const canDelete = (employeeId: string) => {
    return user && user.role === "super_admin" && employeeId !== user.id;
  };

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
      <div className="mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold">
          Company Employees ({pagination?.totalUsers || 0})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Click on any employee to view their profile
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
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
            placeholder="Search employees..."
            className="block w-full pl-10 pr-12 py-2 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 transition-colors"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={clearEmployeesSearch}
                className="mr-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Search Stats */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {employees.length > 0
              ? `Found ${pagination?.totalUsers || 0} employee${
                  (pagination?.totalUsers || 0) !== 1 ? "s" : ""
                }`
              : `No employees found`}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6 md:py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Loading employees...
          </p>
        </div>
      )}

      {/* No Employees */}
      {!loading && employees.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <div className="text-gray-500 text-base md:text-lg mb-4">
            No employees found
          </div>
          <p className="text-gray-400 text-sm md:text-base">
            {searchTerm
              ? "No employees match your search criteria"
              : "This company doesn't have any employees yet"}
          </p>
        </div>
      )}

      {/* Employees - Mobile Cards on small screens, Table on larger screens */}
      {!loading && employees.length > 0 && (
        <>
          {/* Mobile Card View (hidden on md and up) */}
          <div className="block md:hidden space-y-3 mb-6">
            {employees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => handleRowClick(employee.id)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {employee.firstName.charAt(0)}
                        {employee.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {employee.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      employee.role === "manager"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {employee.role === "manager" ? "Manager" : "Employee"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      employee.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {(canEdit() || canDelete(employee.id)) && (
                  <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    {canEdit() && (
                      <button
                        onClick={(e) => handleEditClick(e, employee.id)}
                        className="flex-1 btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete(employee.id) && (
                      <button
                        onClick={(e) => handleDeleteUser(e, employee.id)}
                        disabled={deletingId === employee.id}
                        className="flex-1 btn btn-sm btn-error"
                      >
                        {deletingId === employee.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Status
                  </th>
                  {employees.some((emp) => canEdit() || canDelete(emp.id)) && (
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    onClick={() => handleRowClick(employee.id)}
                    style={{
                      borderBottom:
                        index < employees.length - 1
                          ? "1px solid var(--border-color)"
                          : "none",
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
                              {employee.firstName.charAt(0)}
                              {employee.lastName.charAt(0)}
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
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.role === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {employee.role === "manager" ? "Manager" : "Employee"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {employees.some(
                      (emp) => canEdit() || canDelete(emp.id)
                    ) && (
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

                          {canDelete(employee.id) && (
                            <button
                              onClick={(e) => handleDeleteUser(e, employee.id)}
                              disabled={deletingId === employee.id}
                              className="btn btn-sm btn-error"
                              title="Delete Employee"
                            >
                              {deletingId === employee.id
                                ? "Deleting..."
                                : "Delete"}
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

          {/* Simple Responsive Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 md:pt-6">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.usersPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.usersPerPage,
                  pagination.totalUsers
                )}{" "}
                of {pagination.totalUsers} employees
              </div>

              <div className="flex space-x-1 md:space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn btn-secondary px-3 md:px-4"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`btn px-3 md:px-4 ${
                        page === pagination.currentPage
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn btn-secondary px-3 md:px-4"
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
