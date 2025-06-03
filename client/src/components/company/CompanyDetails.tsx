import { EmployeeTable } from './EmployeeTable';
import type { Company } from '../../services/companies';
import { useState } from 'react';

interface CompanyDetailsProps {
    company: Company;
    companyId: string;
    loading?: boolean;
}

export function CompanyDetails({ company, companyId, loading }: CompanyDetailsProps) {
    // Copy ID
    const [copied, setCopied] = useState(false);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(companyId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    if (loading) {
        return (
            <div className="space-y-6">
                {/* Loading skeleton */}
                <div className="card animate-pulse">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            <div>
                                <div className="h-6 bg-gray-200 rounded mb-2 w-48"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">


            {/* Company Information Card */}
            <div className="card">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        {/* Company Logo */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {company.logo ? (
                                <img
                                    src={company.logo}
                                    alt={`${company.name} logo`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-500">
                                    {company.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Company Info */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                            <p className="text-gray-600">{company.email}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                ID: {companyId}
                                <button
                                    onClick={copyToClipboard}
                                    className={`p-0.5 rounded transition-colors ${copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    title="Copy Company ID"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d={copied
                                                ? "M5 13l4 4L19 7"
                                                : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            }
                                        />
                                    </svg>
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                        </label>
                        <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                        >
                            {company.website}
                        </a>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Employees
                        </label>
                        <div className="text-gray-900">
                            {company.users ? company.users.length : 0} employees
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Created Date
                        </label>
                        <div className="text-gray-900">
                            {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Updated
                        </label>
                        <div className="text-gray-900">
                            {new Date(company.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            {company.users && company.users.length > 0 && (
                <EmployeeTable
                    employees={company.users}
                    loading={false}
                />
            )}

            {/* No Employees Message */}
            {(!company.users || company.users.length === 0) && (
                <div className="card">
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">No employees found</div>
                        <p className="text-gray-400">
                            This company doesn't have any employees yet
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}