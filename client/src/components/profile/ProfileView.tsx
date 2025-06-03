import React from 'react';
import { type User } from '../../services/auth';

interface ProfileViewProps {
    user: User;
    onEditClick: () => void;
}

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
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-4xl text-gray-400">👤</span>
                            </div>
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

                    {user.companyId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company ID
                            </label>
                            <div className="text-gray-900 font-medium">
                                {user.companyId}
                            </div>
                        </div>
                    )}
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