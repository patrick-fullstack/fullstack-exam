import { useState, useEffect } from 'react';
import { EmployeeTable } from './EmployeeTable';
import { CompanyForm } from './CompanyForm';
import type { Company, UpdateCompanyData } from '../../services/companies';
import { companyService } from '../../services/companies';
import { auth } from '../../services/auth';

interface CompanyDetailsProps {
    company: Company;
    companyId: string;
    loading?: boolean;
    onUpdate?: (updatedCompany: Company) => void;
    currentUser?: User; // Accept currentUser as prop
}

interface User {
    id: string;
    role: string;
    companyId?: string;
}

export function CompanyDetails({ company, companyId, loading, onUpdate, currentUser }: CompanyDetailsProps) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userLoading, setUserLoading] = useState(!currentUser);

    // Only fetch user if not provided as prop
    const [internalUser, setInternalUser] = useState<User | null>(currentUser || null);

    useEffect(() => {
        // Skip user fetch if currentUser is provided as prop
        if (currentUser) {
            setInternalUser(currentUser);
            setUserLoading(false);
            return;
        }

        // Only fetch if user not provided
        const fetchUser = async () => {
            try {
                const user = await auth.getCurrentUser();
                setInternalUser(user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUser();
    }, [currentUser]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(companyId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Check if user can edit this company (instant if user provided)
    const canEdit = internalUser && (
        internalUser.role === 'super_admin' ||
        (internalUser.role === 'manager' && internalUser.companyId === companyId)
    );

    // Handle edit mode toggle
    const handleEditClick = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    // Handle company update
    const handleUpdateCompany = async (updateData: UpdateCompanyData) => {
        setUpdating(true);
        setError('');
        setSuccess('');

        try {
            const result = await companyService.updateCompany(companyId, updateData);

            if (result.success) {
                setSuccess('Company updated successfully!');
                setIsEditing(false);

                const updatedCompany = result.data?.company || result.data;
                if (onUpdate && updatedCompany) {
                    onUpdate(updatedCompany);
                }

                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            setError('Failed to update company');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    // Show edit form if in editing mode
    if (isEditing && canEdit) {
        return (
            <div className="space-y-6">
                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Edit Company</h2>
                        <button
                            onClick={handleCancelEdit}
                            className="btn btn-secondary"
                            disabled={updating}
                        >
                            Cancel
                        </button>
                    </div>

                    <CompanyForm
                        company={company}
                        mode="edit"
                        onSubmit={handleUpdateCompany}
                        loading={updating}
                        error={error}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="card">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
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

                    {/* Edit Button - Shows immediately if user provided, or with minimal loading */}
                    {userLoading ? (
                        // Small loading state for edit button area
                        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
                    ) : canEdit ? (
                        <button
                            onClick={handleEditClick}
                            className="btn btn-primary"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Company
                        </button>
                    ) : null}
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Employees</label>
                        <div className="text-gray-900">
                            {company.users ? company.users.length : 0} employees
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                        <div className="text-gray-900">
                            {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <div className="text-gray-900">
                            {new Date(company.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            {company && (
                <EmployeeTable
                    employees={company.users || []}
                    loading={loading}
                    currentUserRole={currentUser?.role as 'super_admin' | 'manager' | 'employee'}
                    currentUserId={currentUser?.id}
                    currentUserCompanyId={currentUser?.companyId}
                    onError={(error) => setError(error)}
                    onSuccess={(message) => setSuccess(message)}
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