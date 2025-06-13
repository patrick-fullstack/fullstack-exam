import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../contexts/CompanyContext";
import { useAuth } from "../../contexts/AuthContext";
import type { EmployeeTableProps } from "../../types/companies";

export function EmployeeTable({ companyId }: EmployeeTableProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    employees,
    employeesLoading: loading,
    employeesPagination: pagination,
    employeesSearchTerm: searchTerm,
    deletingEmployeeId: deletingId,
    fetchEmployees,
    searchEmployees,
    clearEmployeesSearch,
    deleteEmployee,
  } = useCompany();

  const [roleFilter, setRoleFilter] = useState<string>("");

  useEffect(() => {
    if (companyId) fetchEmployees(companyId, 1, searchTerm);
  }, [companyId, fetchEmployees, searchTerm, roleFilter]);

  const handleSearch = (value: string) => searchEmployees(value);
  const handleRoleChange = (role: string) => setRoleFilter(role);
  const handleClearFilters = () => { setRoleFilter(""); clearEmployeesSearch(); };
  const handlePageChange = (page: number) => fetchEmployees(companyId, page, searchTerm);
  const handleRowClick = (userId: string) => navigate(`/profile/${userId}`);
  const handleEditClick = (e: React.MouseEvent, userId: string) => { e.stopPropagation(); navigate(`/profile/${userId}?edit=true`); };
  const handleDeleteUser = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this user?")) await deleteEmployee(userId);
  };

  const canEdit = () => user && (user.role === "super_admin" || user.role === "manager");
  const canDelete = (employeeId: string) => user && user.role === "super_admin" && employeeId !== user.id;

  // Filter employees based on role
  const filteredEmployees = roleFilter ? employees.filter(emp => emp.role === roleFilter) : employees;

  if (!companyId) return <div className="card"><div className="text-center py-8 text-gray-500">No company selected</div></div>;

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Company Employees ({filteredEmployees.length})</h3>
        <p className="text-sm text-gray-500 mt-1">Click on any employee to view their profile</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2"
          />
          {searchTerm && (
            <button onClick={clearEmployeesSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select value={roleFilter} onChange={(e) => handleRoleChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2">
            <option value="">All Roles</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          {(searchTerm || roleFilter) && (
            <button onClick={handleClearFilters} className="btn btn-secondary text-sm px-4 py-2">Clear Filters</button>
          )}
        </div>

        {(searchTerm || roleFilter) && (
          <div className="text-sm text-gray-500">
            {filteredEmployees.length > 0 ? `Found ${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? "s" : ""}` : "No employees found"}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-8"><div className="loading loading-spinner loading-lg"></div><p className="text-gray-500 mt-2">Loading...</p></div>}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No employees found</div>
          <p className="text-gray-400">{searchTerm || roleFilter ? "No employees match your filters" : "This company doesn't have any employees yet"}</p>
        </div>
      )}

      {/* Employee List */}
      {!loading && filteredEmployees.length > 0 && (
        <>
          {/* Mobile View */}
          <div className="block md:hidden space-y-3 mb-6">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} onClick={() => handleRowClick(employee.id)} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {employee.avatar ? (
                      <img src={employee.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="text-sm text-gray-600 truncate">{employee.email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.role === "manager" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                    {employee.role === "manager" ? "Manager" : "Employee"}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {(canEdit() || canDelete(employee.id)) && (
                  <div className="flex space-x-2 pt-3 border-t">
                    {canEdit() && <button onClick={(e) => handleEditClick(e, employee.id)} className="flex-1 btn btn-sm btn-secondary">Edit</button>}
                    {canDelete(employee.id) && (
                      <button onClick={(e) => handleDeleteUser(e, employee.id)} disabled={deletingId === employee.id} className="flex-1 btn btn-sm btn-error">
                        {deletingId === employee.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  {filteredEmployees.some((emp) => canEdit() || canDelete(emp.id)) && <th className="text-left py-3 px-4 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} onClick={() => handleRowClick(employee.id)} className="hover:bg-gray-50 cursor-pointer border-b">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {employee.avatar ? (
                            <img src={employee.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{employee.firstName.charAt(0)}{employee.lastName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{employee.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.role === "manager" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                        {employee.role === "manager" ? "Manager" : "Employee"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {filteredEmployees.some((emp) => canEdit() || canDelete(emp.id)) && (
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {canEdit() && <button onClick={(e) => handleEditClick(e, employee.id)} className="btn btn-sm btn-secondary">Edit</button>}
                          {canDelete(employee.id) && (
                            <button onClick={(e) => handleDeleteUser(e, employee.id)} disabled={deletingId === employee.id} className="btn btn-sm btn-error">
                              {deletingId === employee.id ? "Deleting..." : "Delete"}
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              <div className="text-sm text-gray-700">Showing {filteredEmployees.length} of {pagination.totalUsers} employees</div>
              <div className="flex space-x-2">
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage} className="btn btn-secondary px-4">Previous</button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`btn px-4 ${index + 1 === pagination.currentPage ? "btn-primary" : "btn-secondary"}`}>
                    {index + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage} className="btn btn-secondary px-4">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}