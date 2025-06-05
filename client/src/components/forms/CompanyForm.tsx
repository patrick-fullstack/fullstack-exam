import { useState } from 'react';
import type { CreateCompanyData, UpdateCompanyData, Company } from '../../services/companies';

// Create separate interfaces for each mode
interface CreateCompanyFormProps {
    onSubmit: (data: CreateCompanyData) => Promise<void>;
    loading?: boolean;
    error?: string;
    mode: 'create';
    company?: never; // Not allowed in create mode
}

interface EditCompanyFormProps {
    onSubmit: (data: UpdateCompanyData) => Promise<void>;
    loading?: boolean;
    error?: string;
    mode: 'edit';
    company: Company; // Required in edit mode
}

// Union type for props
type CompanyFormProps = CreateCompanyFormProps | EditCompanyFormProps;

export function CompanyForm({ onSubmit, loading, error, company, mode }: CompanyFormProps) {
    const [formData, setFormData] = useState({
        name: company?.name || '',
        email: company?.email || '',
        website: company?.website || '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo || null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            // For create mode, all fields are required
            const submitData: CreateCompanyData = {
                name: formData.name,
                email: formData.email,
                website: formData.website,
                ...(logoFile && { logo: logoFile })
            };
            await onSubmit(submitData);
        } else {
            // For edit mode, only changed fields are included
            const submitData: UpdateCompanyData = {
                ...(formData.name !== company?.name && { name: formData.name }),
                ...(formData.email !== company?.email && { email: formData.email }),
                ...(formData.website !== company?.website && { website: formData.website }),
                ...(logoFile && { logo: logoFile })
            };
            await onSubmit(submitData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* Company Logo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                </label>

                {/* Logo Preview */}
                {logoPreview && (
                    <div className="mb-4">
                        <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-24 h-24 object-cover rounded-lg border"
                            style={{ borderColor: 'var(--border-color)' }}
                        />
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-medium
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                </p>
            </div>

            {/* Company Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input w-full"
                    placeholder="Enter company name"
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Email *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input w-full"
                    placeholder="company@example.com"
                />
            </div>

            {/* Website */}
            <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website *
                </label>
                <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    required
                    className="input w-full"
                    placeholder="https://company.com"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
            >
                {loading ? 'Processing...' : mode === 'create' ? 'Create Company' : 'Update Company'}
            </button>
        </form>
    );
}