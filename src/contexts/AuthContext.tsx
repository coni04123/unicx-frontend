'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, LoginData, RegisterData, ApiError, LoginResponse } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  entityId: string;
  entityPath: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state from localStorage immediately
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (storedUser && accessToken) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set loading to false after initial mount
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user && pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password' && pathname !== '/reset-password') {
      router.push('/login');
    }
    // Redirect to dashboard if authenticated and on login/register page
    else if (!isLoading && user && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password')) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (data: LoginData): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const response: LoginResponse = await api.login(data);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        tenantId: response.user.tenantId,
        entityId: response.user.entityId,
        entityPath: response.user.entityPath,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const response: LoginResponse = await api.register(data);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        tenantId: response.user.tenantId,
        entityId: response.user.entityId,
        entityPath: response.user.entityPath,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      api.clearTokens();
      router.push('/login');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    error,
  };

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
