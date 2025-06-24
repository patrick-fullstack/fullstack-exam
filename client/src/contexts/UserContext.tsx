import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useUser as useUserQuery } from "../hooks/users/queries/useUser";
import { useCompanies } from "../hooks/users/queries/useCompanies";
import { useUpdateProfile } from "../hooks/users/mutations/useUpdate";
import { useCreateUser } from "../hooks/users/mutations/useCreate";
import { useUserPermissions } from "../hooks/users/utils/useUserPermission";
import { useUserUtils } from "../hooks/users/utils/useUserUtils";
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
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom hooks
  const {
    profileUser,
    loading,
    error: userError,
    fetchProfileUser,
    clearError,
    setProfileUser,
  } = useUserQuery();

  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useCompanies();

  const { isOwnProfile, canEditProfile, canEditEmail, canEditCompany } =
    useUserPermissions({ profileUser });

  const {
    getDashboardRoute,
    getPageTitle: getPageTitleUtil,
    formatRole,
  } = useUserUtils({ profileUser, isOwnProfile, isEditing });

  const {
    updateProfile: updateProfileMutation,
    updating,
    error: updateError,
    success: updateSuccess,
    clearMessages: clearUpdateMessages,
  } = useUpdateProfile({
    profileUser,
    isOwnProfile,
    canEditProfile,
    onSuccess: (updatedUser) => {
      setProfileUser(updatedUser);
      setIsEditing(false);
    },
  });

  const {
    createUser: createUserMutation,
    loading: createUserLoading,
    error: createUserError,
    success: createUserSuccess,
    resetForm: resetCreateForm,
    clearMessages: clearCreateUserMessages,
  } = useCreateUser();

  // Combined error and success states
  const error = userError || updateError;
  const success = updateSuccess;

  // Event handlers
  const handleEditClick = useCallback(() => {
    if (!canEditProfile()) {
      clearError();
      clearUpdateMessages();
      return;
    }
    setIsEditing(true);
    clearError();
    clearUpdateMessages();
  }, [canEditProfile, clearError, clearUpdateMessages]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    clearError();
    clearUpdateMessages();
  }, [clearError, clearUpdateMessages]);

  const clearMessages = useCallback(() => {
    clearError();
    clearUpdateMessages();
  }, [clearError, clearUpdateMessages]);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  const setError = useCallback(
    (errorMsg: string) => {
      clearError();
      console.error("Setting error:", errorMsg);
    },
    [clearError]
  );

  const getPageTitle = useCallback(() => {
    return getPageTitleUtil();
  }, [getPageTitleUtil]);

  const createUser = useCallback(
    async (userData: CreateUserData) => {
      await createUserMutation(userData);
    },
    [createUserMutation]
  );

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
        updateProfile: updateProfileMutation,
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
