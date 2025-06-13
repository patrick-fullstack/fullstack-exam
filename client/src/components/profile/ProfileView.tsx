import React from 'react';
import type { ProfileViewProps } from '../../types/user';

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
    const formatRole = (role: string) => {
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center pb-6 border-b border-gray-200">
                <h3 className="mb-4">Profile Picture</h3>
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-500">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div>
                <h3 className="mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <div className="text-gray-900 font-medium">
                            {user.firstName || 'Not provided'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <div className="text-gray-900 font-medium">
                            {user.lastName || 'Not provided'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="text-gray-900 font-medium">
                            {user.email}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="text-gray-900 font-medium">
                            {user.phone || 'Not provided'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div>
                <h3 className="mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <div className="text-gray-900 font-medium">
                            {formatRole(user.role)}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                        </label>
                        <div className="text-gray-900 font-medium">
                            {/* Display company name instead of ID */}
                            {user.company?.name ||
                                (user.companyId ? `Company ID: ${user.companyId}` : 'No Company Assigned')}
                        </div>
                        {user.company?.website && (
                            <div className="text-sm text-gray-500 mt-1">
                                <a
                                    href={user.company.website.startsWith('http') ? user.company.website : `https://${user.company.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {user.company.website}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Status */}
            <div>
                <h3 className="mb-4">Account Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Member Since
                        </label>
                        <div className="text-gray-900 font-medium">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};