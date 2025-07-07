import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { auth, authEvents } from "../services/auth";
import type { User, LoginResult } from "../types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, allowedRole?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  
  const refreshingRef = useRef(false);
  const lastRefreshTime = useRef(0);
  const authEventTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const logout = async (): Promise<void> => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = useCallback(async (): Promise<void> => {
    const now = Date.now();
    
    // Prevent multiple refresh calls within 5 seconds
    if (refreshingRef.current || !initialCheckComplete || (now - lastRefreshTime.current) < 5000) {
      return;
    }
    
    lastRefreshTime.current = now;
    refreshingRef.current = true;
    
    try {
      const isLoggedIn = await auth.checkSession();
      if (isLoggedIn) {
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
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      refreshingRef.current = false;
    }
  }, [initialCheckComplete]);

  // Initial authentication check - only once on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialAuth = async () => {
      setLoading(true);

      try {
        const isLoggedIn = await auth.checkSession();

        if (!isMounted) return;

        if (isLoggedIn) {
          const userData = await auth.getCurrentUser();
          if (isMounted && userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialCheckComplete(true);
        }
      }
    };

    checkInitialAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Setup auth event listener - ONLY after initial check AND only if authenticated
  useEffect(() => {
    if (!initialCheckComplete) return;

    // Only subscribe to auth events if user is authenticated
    // This prevents unnecessary event handling when no user is logged in
    if (isAuthenticated) {
      const debouncedRefresh = () => {
        if (authEventTimeoutRef.current) {
          clearTimeout(authEventTimeoutRef.current);
        }
        
        authEventTimeoutRef.current = setTimeout(() => {
          refreshUser();
        }, 2000); // 2 second debounce
      };

      const unsubscribe = authEvents.subscribe(debouncedRefresh);

      return () => {
        unsubscribe();
        if (authEventTimeoutRef.current) {
          clearTimeout(authEventTimeoutRef.current);
        }
      };
    }
  }, [refreshUser, initialCheckComplete, isAuthenticated]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};