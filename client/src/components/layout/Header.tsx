import React from 'react';
import { Link } from 'react-router-dom';
import { NotificationBell } from '../ui/NotificationBell';

interface HeaderProps {
    title: string;
    subtitle?: string;
    variant?: 'login' | 'dashboard';
    onLogout?: () => void;
    userAvatar?: string;
    userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    variant = 'login',
    onLogout,
    userAvatar,
    userName
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

    // Dashboard header (horizontal with profile and logout)
    return (
        <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid var(--border-gray)',
            padding: '1rem 0'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {title}
                </h1>

                {/* Right side - Profile and Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <NotificationBell />
                    {/* Profile Link */}
                    <Link
                        to="/profile"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            transition: 'background-color 0.2s'
                        }}
                        className="hover:bg-gray-100"
                        title="Edit Profile"
                    >
                        {/* Avatar or Default Icon */}
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="Profile"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid var(--border-gray)'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-green)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                {userName ?
                                    `${userName.charAt(0).toUpperCase()}` :
                                    '👤'
                                }
                            </div>
                        )}

                        {/* Profile Text (hidden on mobile) */}
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            display: 'none'
                        }} className="md:inline">
                            Profile
                        </span>
                    </Link>

                    {/* Logout Button */}
                    {onLogout && (
                        <button
                            className="btn btn-secondary"
                            onClick={onLogout}
                            style={{ fontSize: '0.875rem' }}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};