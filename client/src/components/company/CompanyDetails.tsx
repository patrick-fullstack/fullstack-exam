import { useState, useEffect } from 'react';
import { EmployeeTable } from './EmployeeTable';
import { CompanyForm } from '../forms/CompanyForm';
import { companyService } from '../../services/companies';
import { auth } from '../../services/auth';
import type { CompanyDetailsProps, UpdateCompanyData } from '../../types/companies';
import type { User } from '../../types/User';

export function CompanyDetails({ company, companyId, loading, onUpdate, currentUser }: CompanyDetailsProps) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userLoading, setUserLoading] = useState(!currentUser);
    const [internalUser, setInternalUser] = useState<User | null>(currentUser || null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setInternalUser(currentUser);
            setUserLoading(false);
            return;
        }

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

    const canEdit = internalUser && (
        internalUser.role === 'super_admin' ||
        (internalUser.role === 'manager' && internalUser.companyId === companyId)
    );

    const handleExportCSV = () => {
        setExporting(true);
        setError('');
        setSuccess('');

        companyService.exportCompanyToCSV(companyId)
            .then(() => {
                setSuccess('Company data exported successfully!');
                setTimeout(() => setSuccess(''), 3000);
            })
            .catch((error) => {
                console.error('Export error:', error);
                setError(error instanceof Error ? error.message : 'Failed to export company data');
            })
            .finally(() => {
                setExporting(false);
            });
    };

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

                    {userLoading ? (
                        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
                    ) : canEdit ? (
                        <div className="flex items-center gap-3">
                            {/* Export CSV Button */}
                            <button
                                onClick={handleExportCSV}
                                disabled={exporting}
                                className="btn btn-secondary"
                                title="Export company data to CSV"
                            >
                                {exporting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm mr-2"></span>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export CSV
                                    </>
                                )}
                            </button>

                            {/* Edit Company Button */}
                            <button
                                onClick={handleEditClick}
                                className="btn btn-primary"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Company
                            </button>
                        </div>
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

            {/* ✅ Self-contained EmployeeTable (like CompanyList) */}
            <EmployeeTable
                companyId={companyId}
                currentUserRole={internalUser?.role as 'super_admin' | 'manager' | 'employee'}
                currentUserId={internalUser?.id}
                onError={setError}
                onSuccess={setSuccess}
            />
        </div>
    );
}