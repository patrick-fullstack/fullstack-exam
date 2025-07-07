import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../hooks/company/queries/useEmployee";
import { useDeleteEmployee } from "../../hooks/users/mutations/useDelete";
import { useAuth } from "../../contexts/AuthContext";
import type { EmployeeTableProps } from "../../types/companies";
import { AvatarImage } from "../ui/OptimizedImage";

export function EmployeeTable({ companyId }: EmployeeTableProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");

  const {
    employees,
    loading,
    pagination,
    error,
    fetchEmployees,
    clearEmployeesSearch,
  } = useEmployees();

  const { deleteEmployee, deletingId, error: deleteError, success: deleteSuccess } = useDeleteEmployee();

  useEffect(() => {
    if (companyId) {
      fetchEmployees(companyId, 1, "", "");
    }
  }, [companyId, fetchEmployees]);

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
  };

  const handleClearFilters = () => {
    setRoleFilter("");
    setSearchInput("");
    if (companyId) {
      clearEmployeesSearch(companyId);
    }
  };

  const handlePageChange = (page: number) => {
    if (companyId) {
      fetchEmployees(companyId, page, "", "");
    }
  };

  const handleRowClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, userId: string, userName: string) => {
    e.stopPropagation();
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      const success = await deleteEmployee(userToDelete.id);
      if (success && companyId) {
        fetchEmployees(companyId, pagination?.currentPage || 1, "", "");
      }
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const canDelete = (employeeId: string) =>
    user && user.role === "super_admin" && employeeId !== user.id;

  // Client-side filtering
  const displayedEmployees = useMemo(() => {
    let filtered = employees;
    if (roleFilter) {
      filtered = filtered.filter((emp) => emp.role === roleFilter);
    }
    if (searchInput) {
      const term = searchInput.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(term) ||
          emp.lastName.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [employees, roleFilter, searchInput]);

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
    <>
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-10 w-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong>{userToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white"
                disabled={deletingId === userToDelete.id}
              >
                {deletingId === userToDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {deleteError && (
          <div className="alert alert-error mb-4">
            {deleteError}
          </div>
        )}

        {deleteSuccess && (
          <div className="alert alert-success mb-4">
            {deleteSuccess}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold">
            Company Employees ({pagination?.totalUsers || displayedEmployees.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Click on any employee to view their profile
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchInput && (
              <button
                onClick={handleClearFilters}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            {(searchInput || roleFilter) && (
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary text-sm px-4 py-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          {(searchInput || roleFilter) && (
            <div className="text-sm text-gray-500">
              {displayedEmployees.length > 0
                ? `Found ${displayedEmployees.length} employee${
                    displayedEmployees.length !== 1 ? "s" : ""
                  }`
                : "No employees found"}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="text-gray-500 mt-2">Loading employees...</p>
          </div>
        )}

        {!loading && displayedEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No employees found</div>
            <p className="text-gray-400">
              {searchInput || roleFilter
                ? "No employees match your current filters"
                : "This company doesn't have any employees yet"}
            </p>
          </div>
        )}

        {!loading && displayedEmployees.length > 0 && (
          <>
            {/* Mobile View */}
            <div className="block md:hidden space-y-3 mb-6">
              {displayedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleRowClick(employee.id)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <AvatarImage user={employee} context="card" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {employee.role === "manager" ? "Manager" : "Employee"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => handleRowClick(employee.id)}
                      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <AvatarImage user={employee} context="card" />
                          </div>
                          <div className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {employee.email}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleViewUser(e, employee.id)}
                            className="btn btn-sm btn-secondary"
                          >
                            View
                          </button>
                          {canDelete(employee.id) && (
                            <button
                              onClick={(e) => handleDeleteClick(e, employee.id, `${employee.firstName} ${employee.lastName}`)}
                              disabled={deletingId === employee.id}
                              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                            >
                              {deletingId === employee.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-700">
                  Showing {displayedEmployees.length} of {pagination.totalUsers} employees
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-secondary px-4 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`btn px-4 ${
                        index + 1 === pagination.currentPage
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-secondary px-4 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}