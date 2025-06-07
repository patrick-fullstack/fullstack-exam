import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { emailService } from '../../services/email';
import type { CreateEmailData, EmailTemplate } from '../../services/email';

interface EmailFormProps {
    onSubmit: (emailData: CreateEmailData) => Promise<void>;
    loading?: boolean;
    error?: string;
    resetForm?: boolean;
}

export const EmailForm: React.FC<EmailFormProps> = ({
    onSubmit,
    loading = false,
    error,
    resetForm = false
}) => {
    const initialFormState: CreateEmailData = {
        fromName: '',
        toName: '',
        toEmail: '',
        subject: '',
        message: '',
        template: 'default',
        sendNow: true,
        scheduledFor: '',
    };

    const [formData, setFormData] = useState<CreateEmailData>(initialFormState);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [validationErrors, setValidationErrors] = useState<Partial<CreateEmailData>>({});
    const formatDateTimeForServer = (dateTimeLocal: string | undefined): string | undefined => {
    if (!dateTimeLocal) return undefined;
    const localDate = new Date(dateTimeLocal);
    
    // Convert to UTC ISO string
    // This will convert Philippines time to UTC (6:40 PM PHT is 10:40 AM UTC)
    return localDate.toISOString();
};

    // Load templates when component mounts
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const result = await emailService.getTemplates();
                if (result.success && result.data) {
                    setTemplates(result.data);
                }
            } catch (error) {
                console.error('Failed to load templates:', error);
            }
        };

        loadTemplates();
    }, []);

    // Reset form when resetForm prop changes
    useEffect(() => {
        if (resetForm) {
            setFormData(initialFormState);
            setValidationErrors({});
        }
    }, [resetForm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear validation error when user starts typing
        if (validationErrors[name as keyof CreateEmailData]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<CreateEmailData> = {};

        // Required field validation
        if (!formData.fromName.trim()) errors.fromName = 'From name is required';
        if (!formData.toName.trim()) errors.toName = 'To name is required';
        if (!formData.toEmail.trim()) errors.toEmail = 'To email is required';
        if (!formData.subject.trim()) errors.subject = 'Subject is required';
        if (!formData.message.trim()) errors.message = 'Message is required';

        // Email validation
        if (formData.toEmail && !/\S+@\S+\.\S+/.test(formData.toEmail)) {
            errors.toEmail = 'Please enter a valid email address';
        }

        // Scheduled date validation
        if (!formData.sendNow) {
            if (!formData.scheduledFor) {
                errors.scheduledFor = 'Scheduled date is required when not sending immediately';
            } else {
                const scheduledDate = new Date(formData.scheduledFor);
                const now = new Date();
                if (scheduledDate <= now) {
                    errors.scheduledFor = 'Scheduled date must be in the future';
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Clean up data before submitting
        const submitData = {
        ...formData,
        scheduledFor: formData.sendNow 
            ? undefined 
            : formatDateTimeForServer(formData.scheduledFor),
    };

        await onSubmit(submitData);
    };

    const handleReset = () => {
        setFormData(initialFormState);
        setValidationErrors({});
    };

    // Get minimum datetime for the datetime-local input
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
        return now.toISOString().slice(0, 16);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* From Information */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">From Information</h3>
                <Input
                    label="From Name *"
                    name="fromName"
                    value={formData.fromName}
                    onChange={handleInputChange}
                    disabled={loading}
                    error={validationErrors.fromName}
                    placeholder="Enter sender name"
                    required
                />
            </div>

            {/* To Information */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">To Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="To Name *"
                        name="toName"
                        value={formData.toName}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={validationErrors.toName}
                        placeholder="Enter recipient name"
                        required
                    />

                    <Input
                        label="To Email *"
                        name="toEmail"
                        type="email"
                        value={formData.toEmail}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={validationErrors.toEmail}
                        placeholder="Enter recipient email"
                        required
                    />
                </div>
            </div>

            {/* Email Content */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Content</h3>

                <div className="space-y-4">
                    <Input
                        label="Subject *"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        disabled={loading}
                        error={validationErrors.subject}
                        placeholder="Enter email subject"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message *
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            disabled={loading}
                            rows={6}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${validationErrors.message ? 'border-red-300' : ''
                                }`}
                            placeholder="Enter your message here..."
                            required
                        />
                        {validationErrors.message && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Template
                        </label>
                        <select
                            name="template"
                            value={formData.template}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="default">Default Template</option>
                            <option value="business">Business Template</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Send Options */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Options</h3>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="sendNow"
                            name="sendNow"
                            checked={formData.sendNow}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sendNow" className="text-sm font-medium text-gray-700">
                            Send immediately
                        </label>
                    </div>

                    {!formData.sendNow && (
                        <div>
                            <Input
                                label="Schedule for *"
                                name="scheduledFor"
                                type="datetime-local"
                                value={formData.scheduledFor}
                                onChange={handleInputChange}
                                disabled={loading}
                                error={validationErrors.scheduledFor}
                                min={getMinDateTime()}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Select when you want this email to be sent ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    Reset Form
                </button>

                <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                >
                    {formData.sendNow ? 'Send Now' : 'Schedule Email'}
                </Button>
            </div>
        </form>
    );
};