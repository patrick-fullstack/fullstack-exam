import React, { useState } from 'react';
import type { UpdateProfileRequest, ProfileEditProps } from '../../types/user';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AvatarUpload } from '../ui/AvatarUpload';

export const ProfileEdit: React.FC<ProfileEditProps> = ({
    user,
    onSave,
    onCancel,
    loading = false,
    error,
    currentUser
}) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        companyId: user.companyId || '',
        password: '',
        confirmPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Permission checks
    const canEditEmail = () => {
        if (!currentUser) return false;
        return currentUser.id === user.id ||
            currentUser.role === 'super_admin' ||
            (currentUser.role === 'manager' && user.role === 'employee' && user.companyId === currentUser.companyId);
    };

    const canEditCompany = () => {
        return currentUser?.role === 'super_admin';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

        if (formData.password) {
            if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const updateData: UpdateProfileRequest = {};

        // Only include changed fields
        if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
        if (formData.phone !== user.phone) updateData.phone = formData.phone;
        if (canEditEmail() && formData.email !== user.email) updateData.email = formData.email;
        if (canEditCompany() && formData.companyId !== user.companyId) updateData.companyId = formData.companyId;
        if (formData.password) updateData.password = formData.password;
        if (avatarFile) updateData.avatar = avatarFile;

        await onSave(updateData);
    };

    const emailEditable = canEditEmail();
    const companyEditable = canEditCompany();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Avatar Section */}
            <div className="text-center pb-6 border-b border-gray-200">
                <h3 className="mb-4">Profile Picture</h3>
                <AvatarUpload
                    currentAvatar={user.avatar}
                    onAvatarChange={setAvatarFile}
                    disabled={loading}
                />
            </div>

            {/* Personal Information */}
            <div>
                <h3 className="mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="First Name *"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={errors.firstName}
                        required
                    />

                    <Input
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={errors.lastName}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Input
                            label={`Email Address *${!emailEditable ? ' (Read Only)' : ''}`}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading || !emailEditable}
                            error={errors.email}
                            required
                        />
                        {!emailEditable && (
                            <p className="text-xs text-gray-500 mt-1">
                                {user.role === 'employee' && currentUser?.role === 'employee'
                                    ? "Contact your manager to change your email"
                                    : "Email can only be changed by authorized personnel"
                                }
                            </p>
                        )}
                    </div>

                    <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                        placeholder="Enter your phone number"
                    />
                </div>
            </div>

            {/* Account Information */}
            <div>
                <h3 className="mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <input
                            type="text"
                            value={user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            disabled
                            className="input-field bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company {companyEditable ? '*' : ''}
                        </label>

                        {companyEditable ? (
                            <div>
                                <Input
                                    label=""
                                    name="companyId"
                                    value={formData.companyId}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    placeholder="Enter Company ID"
                                    error={errors.companyId}
                                />
                                <p className="text-xs text-blue-600 mt-1">
                                    ✓ Super Admin can edit Company ID
                                </p>
                                {user.company?.name && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current: {user.company.name}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    value={user.company?.name || `Company ID: ${user.companyId || 'None'}`}
                                    disabled
                                    className="input-field bg-gray-50"
                                />
                                {user.company?.website && (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Website: {user.company.website}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div>
                <h3 className="mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={errors.password}
                        placeholder="Leave blank to keep current password"
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={errors.confirmPassword}
                        placeholder="Confirm new password"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Cancel
                </button>

                <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
};