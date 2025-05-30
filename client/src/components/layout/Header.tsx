import React from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string;
    variant?: 'login' | 'dashboard';
    onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    variant = 'login',
    onLogout
}) => {

    // Login header (with logo)
    if (variant === 'login') {
        return (
            <div className="text-center mb-8">
                {/* Logo */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'var(--primary-green)',
                    borderRadius: '12px',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        C
                    </span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>
                    {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p style={{ color: 'var(--text-gray)' }}>
                        {subtitle}
                    </p>
                )}
            </div>
        );
    }

    // Dashboard header (horizontal with logout)
    return (
        <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid var(--border-gray)',
            padding: '1rem 0'
        }}>
            <div className="container flex-between">
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {title}
                </h1>
                {onLogout && (
                    <button className="btn btn-secondary" onClick={onLogout}>
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
};