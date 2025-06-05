import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AvatarUpload } from '../ui/AvatarUpload';

export interface CreateUserData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'super_admin' | 'manager' | 'employee';
    companyId?: string;
    avatar?: File;
}

interface CreateUserFormProps {
    onSubmit: (userData: CreateUserData) => Promise<void>;
    loading?: boolean;
    error?: string;
    resetForm?: boolean;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
    onSubmit,
    loading = false,
    error,
    resetForm = false
}) => {
    const initialFormState: CreateUserData = {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'employee',
        companyId: '',
    };

    const [formData, setFormData] = useState<CreateUserData>(initialFormState);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<CreateUserData>>({});
    const [avatarKey, setAvatarKey] = useState(0);

    useEffect(() => {
        if (resetForm) {
            // Reset all form data to initial state
            setFormData(initialFormState);
            setAvatarFile(null);
            setFieldErrors({});
            setAvatarKey(prev => prev + 1);

        }
    }, [resetForm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (fieldErrors[name as keyof CreateUserData]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<CreateUserData> = {};

        // Required field validation
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.phone) errors.phone = 'Phone is required';

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        // Password validation
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Password confirmation
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Company ID validation for non-super admin roles
        if (formData.role !== 'super_admin' && !formData.companyId) {
            errors.companyId = 'Company ID is required for managers and employees';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            avatar: avatarFile || undefined
        };

        await onSubmit(submitData);
    };

    const handleReset = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'employee',
            companyId: '',
        });
        setAvatarFile(null);
        setFieldErrors({});
        setAvatarKey(prev => prev + 1);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Messages */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Avatar Upload */}
            <div className="text-center">
                <h3 className="mb-4">Profile Picture (Optional)</h3>
                <AvatarUpload
                    key={avatarKey}
                    onAvatarChange={setAvatarFile}
                    disabled={loading}
                    currentAvatar={undefined}

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
                        error={fieldErrors.firstName}
                        placeholder="Enter first name"
                    />

                    <Input
                        label="Last Name *"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.lastName}
                        placeholder="Enter last name"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                        label="Email Address *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.email}
                        placeholder="Enter email address"
                    />

                    <Input
                        label="Phone Number *"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.phone}
                        placeholder="Enter phone number"
                    />
                </div>
            </div>

            {/* Account Information */}
            <div>
                <h3 className="mb-4">Account Information</h3>

                {/* Role Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="input-field"
                    >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>

                {/* Company ID (conditional) */}
                {formData.role !== 'super_admin' && (
                    <Input
                        label="Company ID *"
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.companyId}
                        placeholder="Enter company ID"
                    />
                )}
            </div>

            {/* Password Section */}
            <div>
                <h3 className="mb-4">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Password *"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.password}
                        placeholder="Enter password (min 6 characters)"
                    />

                    <Input
                        label="Confirm Password *"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={fieldErrors.confirmPassword}
                        placeholder="Confirm password"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Reset Form
                </button>

                <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                >
                    Create User
                </Button>
            </div>
        </form>
    );
};