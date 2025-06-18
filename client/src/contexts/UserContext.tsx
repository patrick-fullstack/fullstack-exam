import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../services/users";
import { auth } from "../services/auth";
import { useAuth } from "./AuthContext";
import { companyService } from "../services/companies";
import type { User, UpdateProfileRequest, CreateUserData } from "../types/user";
import type { Company } from "../types/companies";

interface UserContextType {
  // Profile states & functions
  profileUser: User | null;
  loading: boolean;
  updating: boolean;
  error: string;
  success: string;
  isEditing: boolean;
  isModalOpen: boolean;
  isOwnProfile: boolean;
  fetchProfileUser: (userId?: string) => Promise<void>;
  handleEditClick: () => void;
  handleCancelEdit: () => void;
  updateProfile: (updateData: UpdateProfileRequest) => Promise<void>;
  setError: (error: string) => void;
  clearMessages: () => void;
  toggleModal: () => void;
  canEditProfile: () => boolean;
  canEditEmail: () => boolean;
  canEditCompany: () => boolean;
  getPageTitle: () => string;
  getDashboardRoute: () => string;
  formatRole: (role: string) => string;

  // User Creation states & functions
  createUserLoading: boolean;
  createUserError: string;
  createUserSuccess: string;
  resetCreateForm: boolean;
  companies: Company[];
  companiesLoading: boolean;
  companiesError: string;
  createUser: (userData: CreateUserData) => Promise<void>;
  clearCreateUserMessages: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user: currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Profile state
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User creation state
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");
  const [resetCreateForm, setResetCreateForm] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState("");

  // Fetch companies for dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError("");

      const response = await companyService.getCompanies({
        page: 1,
        limit: 100, // Get all companies
      });

      if (response.success) {
        setCompanies(response.data.companies || []);
      } else {
        setCompaniesError("Failed to load companies");
      }

      setCompaniesLoading(false);
    };

    fetchCompanies();
  }, []);

  // Computed property
  const isOwnProfile = !!(
    currentUser &&
    profileUser &&
    currentUser.id === profileUser.id
  );

  // Permission checks
  const canEditProfile = useCallback(() => {
    if (!currentUser || !profileUser) return false;
    if (currentUser.id === profileUser.id) return true;
    if (currentUser.role === "super_admin") return true;
    if (currentUser.role === "manager") {
      return (
        profileUser.companyId === currentUser.companyId &&
        profileUser.role === "employee"
      );
    }
    return false;
  }, [currentUser, profileUser]);

  const canEditEmail = useCallback(() => {
    if (!currentUser || !profileUser) return false;
    return (
      currentUser.id === profileUser.id ||
      currentUser.role === "super_admin" ||
      (currentUser.role === "manager" &&
        profileUser.role === "employee" &&
        profileUser.companyId === currentUser.companyId)
    );
  }, [currentUser, profileUser]);

  const canEditCompany = useCallback(
    () => currentUser?.role === "super_admin",
    [currentUser]
  );

  // Utility functions
  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const clearCreateUserMessages = useCallback(() => {
    setCreateUserError("");
    setCreateUserSuccess("");
  }, []);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  const formatRole = useCallback(
    (role: string) =>
      role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    []
  );

  // Main actions
  const fetchProfileUser = useCallback(
    async (userId?: string) => {
      if (!currentUser) return;

      setLoading(true);
      clearMessages();

      if (!userId) {
        setProfileUser(currentUser);
        setLoading(false);
        return;
      }

      const result = await userService.getUserById(userId);

      if (result.success && result.user) {
        setProfileUser(result.user);
      } else {
        setError(result.error || "Failed to load user profile");
      }

      setLoading(false);
    },
    [currentUser, clearMessages]
  );

  const handleEditClick = useCallback(() => {
    if (!canEditProfile()) {
      setError("You do not have permission to edit this profile");
      return;
    }
    setIsEditing(true);
    clearMessages();
  }, [canEditProfile, clearMessages]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    clearMessages();
  }, [clearMessages]);

  const updateProfile = useCallback(
    async (updateData: UpdateProfileRequest) => {
      if (!profileUser || !canEditProfile()) {
        setError("You do not have permission to edit this profile");
        return;
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        return;
      }

      setUpdating(true);
      clearMessages();

      const result = isOwnProfile
        ? await auth.updateProfile(profileUser.id, updateData)
        : await userService.updateUser(profileUser.id, updateData);

      if (result.success) {
        if (isOwnProfile) await refreshUser();

        setSuccess("Profile updated successfully!");
        setProfileUser(result.user);
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
        navigate(
          profileUser.id !== currentUser?.id
            ? `/profile/${profileUser.id}`
            : "/profile"
        );
      } else {
        setError(result.error || "Update failed");
      }

      setUpdating(false);
    },
    [
      profileUser,
      canEditProfile,
      clearMessages,
      isOwnProfile,
      refreshUser,
      navigate,
      currentUser,
    ]
  );

  // Create a new user
  const createUser = useCallback(
    async (userData: CreateUserData) => {
      clearCreateUserMessages();
      setCreateUserLoading(true);
      setResetCreateForm(false);

      try {
        const result = await userService.createUser(userData);

        if (result.success) {
          setCreateUserSuccess(
            `User ${result.user?.firstName} ${result.user?.lastName} created successfully!`
          );
          setResetCreateForm(true);

          // Clear success message after 5 seconds
          setTimeout(() => {
            setCreateUserSuccess("");
            setResetCreateForm(false);
          }, 5000);
        } else {
          setCreateUserError(result.error || "Failed to create user");
        }
      } catch (error) {
        console.error("Create user error:", error);
        setCreateUserError("An unexpected error occurred");
      } finally {
        setCreateUserLoading(false);
      }
    },
    [clearCreateUserMessages]
  );

  const getDashboardRoute = useCallback(() => {
    if (!currentUser) return "/";

    switch (currentUser.role) {
      case "super_admin":
        return "/admin-dashboard";
      case "manager":
        return "/manager-dashboard";
      case "employee":
        return "/employee-dashboard";
      default:
        return "/";
    }
  }, [currentUser]);

  const getPageTitle = useCallback(() => {
    if (isEditing) return "Edit Profile";
    if (isOwnProfile) return "My Profile";
    return profileUser
      ? `${profileUser.firstName} ${profileUser.lastName}'s Profile`
      : "User Profile";
  }, [isEditing, isOwnProfile, profileUser]);

  // Check URL for edit mode
  useEffect(() => {
    const editFromQuery = searchParams.get("edit") === "true";
    if (editFromQuery && canEditProfile()) {
      setIsEditing(true);
    }
  }, [searchParams, canEditProfile]);

  return (
    <UserContext.Provider
      value={{
        // Profile properties
        profileUser,
        loading,
        updating,
        error,
        success,
        isEditing,
        isModalOpen,
        isOwnProfile,
        fetchProfileUser,
        handleEditClick,
        handleCancelEdit,
        updateProfile,
        setError,
        clearMessages,
        toggleModal,
        canEditProfile,
        canEditEmail,
        canEditCompany,
        getPageTitle,
        getDashboardRoute,
        formatRole,

        // User creation properties
        createUserLoading,
        createUserError,
        createUserSuccess,
        resetCreateForm,
        companies,
        companiesLoading,
        companiesError,
        createUser,
        clearCreateUserMessages,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
