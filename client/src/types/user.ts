export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    email: string;
    website: string;
    logo?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  requiredRole?: string;
}

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  actualRole?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  avatar?: File;
  companyId?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "super_admin" | "manager" | "employee";
  companyId?: string;
  avatar?: File;
}

export interface CreateUserFormProps {
  onSubmit: (userData: CreateUserData) => Promise<void>;
  loading?: boolean;
  error?: string;
  resetForm?: boolean;
}

// API Error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  actualRole?: string;
}

export interface ProfileEditProps {
  user: User;
  onSave: (updateData: UpdateProfileRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  currentUser?: User | null;
}

export interface ProfileViewProps {
  user: User;
  onEditClick: () => void;
}
