import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { auth, authEvents } from "../services/auth";
import type { User, LoginResult } from "../types/user";

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Actions
  login: (
    email: string,
    password: string,
    allowedRole?: string
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// The main Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // LOGIN FUNCTION - Called from login pages
  const login = async (
    email: string,
    password: string,
    allowedRole?: string
  ): Promise<LoginResult> => {
    const result = await auth.login(email, password, allowedRole);

    if (result.success && result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
      return {
        success: true,
        user: result.user,
        actualRole: result.actualRole,
      };
    } else {
      return { success: false, error: result.error || "Login failed" };
    }
  };

  // LOGOUT FUNCTION - Called from any component
  const logout = async (): Promise<void> => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // REFRESH USER - Called when user data might have changed
  const refreshUser = async (): Promise<void> => {
    if (auth.isLoggedIn()) {
      const userData = await auth.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // CHECK AUTH STATUS ON APP START
  useEffect(() => {
    const checkInitialAuth = async () => {
      setLoading(true);

      const isLoggedIn = auth.isLoggedIn();

      if (isLoggedIn) {
        const userData = await auth.getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          await auth.logout(); // Clear invalid token
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkInitialAuth();
  }, []);

  // LISTEN TO AUTH EVENTS (login, logout, token expiration)
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      refreshUser();
    });

    return unsubscribe;
  }, []);

  // PROVIDE CONTEXT VALUE
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// CUSTOM HOOK - This is what components will use
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
