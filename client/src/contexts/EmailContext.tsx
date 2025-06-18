import React, { createContext, useContext, useState, useCallback } from 'react';
import { emailService } from '../services/email';
import type { ScheduledEmail, CreateEmailData } from '../types/emails';

interface EmailContextType {
    emails: ScheduledEmail[];
    loading: boolean;
    error: string | null;
    currentEmail: ScheduledEmail | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalEmails: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    loadEmails: (page?: number, status?: string) => Promise<void>;
    createEmail: (emailData: CreateEmailData) => Promise<boolean>;
    getEmailById: (emailId: string) => Promise<boolean>;
    cancelEmail: (emailId: string) => Promise<boolean>;
    retryEmail: (emailId: string) => Promise<boolean>;
    clearError: () => void;
    setCurrentEmail: (email: ScheduledEmail | null) => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const useEmail = () => {
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error('useEmail must be used within an EmailProvider');
    }
    return context;
};

interface EmailProviderProps {
    children: React.ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
    const [emails, setEmails] = useState<ScheduledEmail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentEmail, setCurrentEmail] = useState<ScheduledEmail | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalEmails: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const loadEmails = useCallback(async (page: number = 1, status?: string) => {
        setLoading(true);
        setError(null);

        const result = await emailService.getEmails({
            page,
            limit: 10,
            status: status || undefined,
        });

        if (result.success && result.data) {
            setEmails(result.data.emails);
            setPagination(result.data.pagination);
        } else {
            setError(result.error || 'Failed to load emails');
        }

        setLoading(false);
    }, []);

    const createEmail = useCallback(async (emailData: CreateEmailData): Promise<boolean> => {
        setError(null);
        const result = await emailService.createEmail(emailData);

        if (result.success) {
            await loadEmails(pagination.currentPage);
            return true;
        } else {
            setError(result.error || 'Failed to create email');
            return false;
        }
    }, [pagination.currentPage, loadEmails]);

    const getEmailById = useCallback(async (emailId: string): Promise<boolean> => {
        setError(null);
        const result = await emailService.getEmailById(emailId);

        if (result.success && result.data) {
            setCurrentEmail(result.data);
            return true;
        } else {
            setError(result.error || 'Failed to load email details');
            return false;
        }
    }, []);

    const cancelEmail = useCallback(async (emailId: string): Promise<boolean> => {
        setError(null);
        const result = await emailService.cancelEmail(emailId);

        if (result.success) {
            await loadEmails(pagination.currentPage);
            return true;
        } else {
            setError(result.error || 'Failed to cancel email');
            return false;
        }
    }, [pagination.currentPage, loadEmails]);

    const retryEmail = useCallback(async (emailId: string): Promise<boolean> => {
        setError(null);
        const result = await emailService.retryEmail(emailId);

        if (result.success) {
            await loadEmails(pagination.currentPage);
            return true;
        } else {
            setError(result.error || 'Failed to retry email');
            return false;
        }
    }, [pagination.currentPage, loadEmails]);

    const value: EmailContextType = {
        emails,
        loading,
        error,
        currentEmail,
        pagination,
        loadEmails,
        createEmail,
        getEmailById,
        cancelEmail,
        retryEmail,
        clearError,
        setCurrentEmail,
    };

    return (
        <EmailContext.Provider value={value}>
            {children}
        </EmailContext.Provider>
    );
};