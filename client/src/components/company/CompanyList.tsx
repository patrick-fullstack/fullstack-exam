import { useEffect } from "react";
import { CompanyCard } from "./CompanyCard";
import { useCompany } from "../../contexts/CompanyContext";
import type { CompanyListProps } from "../../types/companies";

export function CompanyList({ userRole }: CompanyListProps) {
  const {
    companies,
    companiesLoading: loading,
    companiesPagination: pagination,
    companiesSearchTerm: searchTerm,
    fetchCompanies,
    searchCompanies,
    clearCompaniesSearch,
  } = useCompany();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (value: string) => {
    searchCompanies(value);
  };

  const handlePageChange = (page: number) => {
    fetchCompanies(page, searchTerm);
  };

  return (
    <div className="px-2 sm:px-4">
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
            placeholder="Search companies..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 transition-colors text-sm sm:text-base"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={clearCompaniesSearch}
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

        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500">
            {companies.length > 0
              ? `Found ${pagination?.totalCompanies || 0} company${(pagination?.totalCompanies || 0) !== 1 ? "s" : ""
              } matching "${searchTerm}"`
              : `No companies found matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-gray-500 mt-2">Loading companies...</p>
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {searchTerm ? "No companies found" : "No companies available"}
          </div>
          <p className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "There are no companies in the system yet"}
          </p>
        </div>
      )}

      {!loading && companies.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                userRole={userRole}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4 mb-6">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.companiesPerPage + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.companiesPerPage,
                  pagination.totalCompanies
                )}{" "}
                of {pagination.totalCompanies} companies
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn btn-secondary min-w-[80px]"
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`btn min-w-[40px] ${page === pagination.currentPage
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
                  className="btn btn-secondary min-w-[80px]"
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