import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { verifyToken, logout as apiLogout, getStoredUser } from '../services/auth';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const storedUser = getStoredUser();
        if (!storedUser) {
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        const isValid = await verifyToken();
        if (!isValid) {
          apiLogout();
          setUser(null);
        } else {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        apiLogout();
        setUser(null);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isInitialized,
    error
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}