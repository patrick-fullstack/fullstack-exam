import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            disabled={loading || disabled}
            {...props}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
};