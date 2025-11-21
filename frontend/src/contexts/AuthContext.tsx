'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isResident: () => boolean;
  isPropertyAdmin: () => boolean;
  isMaintenance: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await apiService.signup(email, password, passwordConfirmation);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch {
      // Even if logout fails on server, clear local state
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const isResident = () => {
    return !user?.role || user.role === 'resident';
  };

  const isPropertyAdmin = () => {
    return user?.role === 'property_admin';
  };

  const isMaintenance = () => {
    return user?.role === 'maintenance';
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuth,
    isResident,
    isPropertyAdmin,
    isMaintenance,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
