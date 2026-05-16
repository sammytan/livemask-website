import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { authClient, getErrorMessage } from "@/lib/api";
import type { User, LoginRequest, RegisterRequest, ApiError } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    if (authClient.isAuthenticated()) {
      authClient
        .getMe()
        .then((user) => {
          setState({ user, isAuthenticated: true, isLoading: false, error: null });
        })
        .catch(() => {
          setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
        });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await authClient.login(data);
      setState({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const apiErr = err as ApiError;
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: getErrorMessage(apiErr),
      });
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authClient.register(data);
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const apiErr = err as ApiError;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: getErrorMessage(apiErr),
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } catch {
      // Clear session even if server logout fails
    }
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
