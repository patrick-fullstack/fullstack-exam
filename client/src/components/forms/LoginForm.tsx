import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { LoginFormProps } from '../../types/User';

export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit,
    loading = false,
    error
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous field errors
        setFieldErrors({});

        // Basic validation
        const errors: { email?: string; password?: string } = {};
        if (!email) errors.email = 'Email is required';
        if (!password) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        await onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error Message */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Email Input */}
            <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                error={fieldErrors.email}
            />

            {/* Password Input */}
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                error={fieldErrors.password}
            />

            {/* Submit Button */}
            <Button
                type="submit"
                loading={loading}
                disabled={loading}
                style={{ width: '100%' }}
            >
                Sign In
            </Button>
        </form>
    );
};