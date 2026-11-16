'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'RETAILER' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  householdId?: string;
  retailerId?: string;
  emailVerifiedAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  memberships: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = api.getAuthToken();
      if (!token) {
        setUser(null);
        setMemberships([]);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        setMemberships(data.memberships || []);
      } else {
        setUser(null);
        setMemberships([]);
      }
    } catch {
      setUser(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    await refreshUser();
    return res;
  };

  const register = async (data: any) => {
    return api.register(data);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setMemberships([]);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
