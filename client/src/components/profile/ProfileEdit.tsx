import React, { useState, useEffect } from "react";
import type { UpdateProfileRequest } from "../../types/user";
import type { Company } from "../../types/companies";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { AvatarUpload } from "../ui/AvatarUpload";
import { useUser } from "../../contexts/UserContext";
import { companyService } from "../../services/companies";
import { CompanyLogo } from "../ui/OptimizedImage";

export const ProfileEdit: React.FC = () => {
  const {
    profileUser,
    updating,
    error,
    handleCancelEdit,
    updateProfile,
    canEditEmail,
    canEditCompany,
    isOwnProfile,
    formatRole,
  } = useUser();

  const user = profileUser!;

  // Determine if role is editable (not super admin and not own profile)
  const isRoleEditable =
    canEditCompany() && user.role !== "super_admin" && !isOwnProfile;
  const isCompanyEditable = canEditCompany() && user.role !== "super_admin";

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    email: user.email || "",
    companyId: user.companyId || "",
    role: user.role || "",
    password: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Company dropdown state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState("");

  // Fetch companies for dropdown
  useEffect(() => {
    if (isCompanyEditable) {
      setCompaniesLoading(true);
      companyService
        .getCompanies({ page: 1, limit: 1000 })
        .then((response) => {
          if (response.success) {
            setCompanies(response.data.companies || []);
          } else {
            setCompaniesError("Failed to load companies");
          }
        })
        .finally(() => setCompaniesLoading(false));
    }
  }, [isCompanyEditable]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (formData.password) {
      if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updateData: UpdateProfileRequest = {};

    // Only include changed fields
    if (formData.firstName !== user.firstName)
      updateData.firstName = formData.firstName;
    if (formData.lastName !== user.lastName)
      updateData.lastName = formData.lastName;
    if (formData.phone !== user.phone) updateData.phone = formData.phone;
    if (canEditEmail() && formData.email !== user.email)
      updateData.email = formData.email;

    // Only add role/company changes if allowed
    if (isRoleEditable && formData.role !== user.role)
      updateData.role = formData.role;
    if (isCompanyEditable && formData.companyId !== user.companyId)
      updateData.companyId = formData.companyId;

    if (formData.password) updateData.password = formData.password;
    if (avatarFile) updateData.avatar = avatarFile;

    await updateProfile(updateData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="alert alert-error">{error}</div>}
      {companiesError && (
        <div className="alert alert-error">{companiesError}</div>
      )}

      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="mb-4">Profile Picture</h3>
        <AvatarUpload
          currentAvatar={user.avatar}
          onAvatarChange={setAvatarFile}
          disabled={updating}
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
            disabled={updating}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name *"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={updating}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Input
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={updating || !canEditEmail()}
              error={errors.email}
              required
            />
          </div>

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={updating}
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            {isRoleEditable ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={updating}
                className="input-field"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            ) : (
              <input
                type="text"
                value={formatRole(user.role)}
                disabled
                className="input-field bg-gray-50"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            {isCompanyEditable ? (
              <div>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  disabled={updating || companiesLoading}
                  className="input-field"
                >
                  <option value="">
                    {companiesLoading ? "Loading..." : "Select a company"}
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
                      return selectedCompany ? (
                        <div className="flex items-center space-x-2">
                          <CompanyLogo
                            company={selectedCompany}
                            context="card"
                          />
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
                      ) : (
                        <p className="text-xs text-blue-600">
                          Current Company ID: {formData.companyId}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={user.company?.name || "No Company"}
                  disabled
                  className="input-field bg-gray-50"
                />
                {user.company?.website && (
                  <div className="text-sm text-gray-500 mt-1">
                    Website: {user.company.website}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="New Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={updating}
            error={errors.password}
            placeholder="Leave blank to keep current password"
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={updating}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancelEdit}
          className="btn btn-secondary"
          disabled={updating}
        >
          Cancel
        </button>

        <Button type="submit" loading={updating} disabled={updating}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
