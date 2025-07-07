import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useUser as useUserQuery } from "../hooks/users/queries/useUser";
import { useUpdateProfile } from "../hooks/users/mutations/useUpdate";
import { useCreateUser } from "../hooks/users/mutations/useCreate";
import { useUserPermissions } from "../hooks/users/utils/useUserPermission";
import { useUserUtils } from "../hooks/users/utils/useUserUtils";
import type { User, UpdateProfileRequest, CreateUserData } from "../types/user";

interface UserContextType {
  // User state
  profileUser: User | null;
  loading: boolean;
  error: string;
  success: string;
  isEditing: boolean;
  isModalOpen: boolean;
  updating: boolean;

  // Actions
  fetchProfileUser: (userId?: string) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<void>;
  handleCancelEdit: () => void;
  handleEditClick: () => void;
  
  // UI state
  setIsEditing: (editing: boolean) => void;
  toggleModal: () => void;
  clearMessages: () => void;
  setError: (error: string) => void;

  // Permissions
  isOwnProfile: boolean;
  canEditProfile: () => boolean;
  canEditEmail: () => boolean;
  canEditCompany: () => boolean;

  // Utils
  getDashboardRoute: () => string;
  getPageTitle: () => string;
  formatRole: (role: string) => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom hooks
  const {
    profileUser,
    loading: userLoading,
    error: userError,
    fetchProfileUser,
    clearError,
    setProfileUser,
  } = useUserQuery();

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
    loading: creatingUser,
    error: createError,
    success: createSuccess,
    clearMessages: clearCreateMessages,
  } = useCreateUser();

  // Combine all errors and success messages
  const error = userError || updateError || createError;
  const success = updateSuccess || createSuccess;
  const combinedLoading = userLoading || updating || creatingUser;

  // Define clearMessages FIRST before other callbacks that use it
  const clearMessages = useCallback(() => {
    clearError();
    clearUpdateMessages();
    clearCreateMessages();
  }, [clearError, clearUpdateMessages, clearCreateMessages]);

  // Actions - now clearMessages is available
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      await updateProfileMutation(data);
    },
    [updateProfileMutation]
  );

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    clearMessages();
    
    // Add edit parameter to URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  }, [setIsEditing, clearMessages, searchParams, setSearchParams]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    clearMessages();
    
    // Remove edit parameter from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("edit");
    setSearchParams(newSearchParams);
  }, [setIsEditing, clearMessages, searchParams, setSearchParams]);

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
        // User state
        profileUser,
        loading: combinedLoading,
        error,
        success,
        isEditing,
        isModalOpen,
        updating,

        // Actions
        fetchProfileUser,
        updateProfile,
        createUser,
        handleCancelEdit,
        handleEditClick,
        
        // UI state
        setIsEditing,
        toggleModal,
        clearMessages,
        setError,

        // Permissions
        isOwnProfile,
        canEditProfile,
        canEditEmail,
        canEditCompany,

        // Utils
        getDashboardRoute,
        getPageTitle,
        formatRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};