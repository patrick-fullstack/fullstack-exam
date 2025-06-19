import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AvatarUpload } from "../ui/AvatarUpload";
import { useUser } from "../../contexts/UserContext";
import type { CreateUserData } from "../../types/user";
import { CompanyLogo } from "../ui/OptimizedImage";

export const CreateUserForm: React.FC = () => {
  const {
    createUser,
    createUserLoading: loading,
    createUserError: error,
    resetCreateForm,
    companies,
    companiesLoading,
    companiesError,
  } = useUser();

  const initialFormState: CreateUserData = {
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "employee",
    companyId: "",
  };

  const [formData, setFormData] = useState<CreateUserData>(initialFormState);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarKey, setAvatarKey] = useState(0);

  // Reset form when resetCreateForm is true
  useEffect(() => {
    if (resetCreateForm) {
      setFormData(initialFormState);
      setAvatarFile(null);
      setFieldErrors({});
      setAvatarKey((prev) => prev + 1);
    }
  }, [resetCreateForm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof CreateUserData]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof CreateUserData)[] = [
      "email",
      "password",
      "confirmPassword",
      "firstName",
      "lastName",
      "phone",
    ];

    // Required field validation
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = `${
          field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, " $1")
        } is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Company ID validation
    if (!formData.companyId) {
      errors.companyId = "Please select a company";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await createUser({
      ...formData,
      avatar: avatarFile || undefined,
    });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setAvatarFile(null);
    setFieldErrors({});
    setAvatarKey((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || companiesError) && (
        <div className="alert alert-error">{error || companiesError}</div>
      )}

      <div className="text-center">
        <h3 className="mb-4">Profile Picture (Optional)</h3>
        <AvatarUpload
          key={avatarKey}
          onAvatarChange={setAvatarFile}
          disabled={loading}
          currentAvatar={undefined}
          context="profile"
        />
      </div>

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

      <div>
        <h3 className="mb-4">Account Information</h3>

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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleInputChange}
            disabled={loading || companiesLoading}
            className={`input-field ${
              fieldErrors.companyId ? "border-red-500" : ""
            }`}
          >
            <option value="">
              {companiesLoading ? "Loading companies..." : "Select a company"}
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          {formData.companyId && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              {(() => {
                const selectedCompany = companies.find(
                  (c) => c.id === formData.companyId
                );
                return (
                  selectedCompany && (
                    <div className="flex items-center space-x-2">
                      <CompanyLogo company={selectedCompany} context="card" />
                      <div>
                        <p className="text-sm font-medium">
                          {selectedCompany.name}
                        </p>
                        {selectedCompany.website && (
                          <p className="text-xs text-gray-500">
                            {selectedCompany.website}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          )}

          {fieldErrors.companyId && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.companyId}</p>
          )}
        </div>
      </div>

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

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
          disabled={loading}
        >
          Reset Form
        </button>

        <Button type="submit" loading={loading} disabled={loading}>
          Create User
        </Button>
      </div>
    </form>
  );
};
