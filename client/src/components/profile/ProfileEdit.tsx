import React, { useState } from 'react';
import { type User, type UpdateProfileRequest } from '../../services/auth';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AvatarUpload } from '../ui/AvatarUpload';

interface ProfileEditProps {
    user: User;
    onSave: (updateData: UpdateProfileRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
    user,
    onSave,
    onCancel,
    loading = false,
    error
}) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const updateData: UpdateProfileRequest = {};

        // Only include changed fields
        if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
        if (formData.phone !== user.phone) updateData.phone = formData.phone;
        if (formData.email !== user.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;
        if (avatarFile) updateData.avatar = avatarFile;

        await onSave(updateData);
    };

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
                        error={validationErrors.firstName}
                        required
                    />

                    <Input
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={validationErrors.lastName}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <Input
                            label={`Email Address * ${user.role === 'employee' ? '(Read Only)' : ''}`}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading || user.role === 'employee'}
                            error={validationErrors.email}
                            required
                        />
                        {user.role === 'employee' && (
                            <p className="text-xs text-gray-500 mt-1">
                                Contact your manager to change your email
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

            {/* Account Information (Read Only) */}
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

                    {user.companyId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company ID
                            </label>
                            <input
                                type="text"
                                value={user.companyId}
                                disabled
                                className="input-field bg-gray-50"
                            />
                        </div>
                    )}
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
                        error={validationErrors.password}
                        placeholder="Leave blank to keep current password"
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={validationErrors.confirmPassword}
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