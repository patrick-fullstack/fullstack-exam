import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div>
            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}
            <input
                className={`form-input ${error ? 'border-red-300' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error-red)' }}>
                    {error}
                </p>
            )}
        </div>
    );
};