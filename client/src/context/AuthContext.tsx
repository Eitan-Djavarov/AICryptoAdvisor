import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearStoredToken, getStoredToken, setStoredToken } from '../services/api';
import type {
  ApiErrorResponse,
  AuthResponse,
  MeResponse,
  User,
  UserPreferences,
} from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: ApiErrorResponse } }).response?.data
      ?.message === 'string'
  ) {
    return (error as { response: { data: ApiErrorResponse } }).response.data
      .message as string;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setPreferences(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setPreferences(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const { data } = await api.get<MeResponse>('/auth/me');
      setUser(data.user);
      setPreferences(data.preferences);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setPreferences(null);
      return data.user;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Login failed'));
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const { data } = await api.post<AuthResponse>('/auth/register', {
          name,
          email,
          password,
        });

        setStoredToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setPreferences(null);
        return data.user;
      } catch (error) {
        throw new Error(extractErrorMessage(error, 'Registration failed'));
      }
    },
    []
  );

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      preferences,
      isAuthenticated: Boolean(token && user),
      onboardingCompleted: Boolean(user?.onboardingCompleted),
      loading,
      login,
      register,
      logout,
      checkAuth,
      updateUser,
      setPreferences,
    }),
    [
      user,
      token,
      preferences,
      loading,
      login,
      register,
      logout,
      checkAuth,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
