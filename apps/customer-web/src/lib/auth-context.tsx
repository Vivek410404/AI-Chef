'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  phone?: string | null;
  role: 'CUSTOMER' | 'RETAILER' | 'ADMIN' | 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  householdId?: string;
  householdRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'CHEF' | 'COOK';
  retailerId?: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  households?: any[];
  householdMembers?: any[];
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  memberships: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phoneNumber?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      // With HttpOnly cookies & silent refresh, always probe /auth/me
      const data = await api.getMe();
      if (data?.user && data.user.id) {
        setUser(data.user);
        setMemberships(data.memberships || data.user.householdMembers || []);
        
        // Load detailed profile in background
        try {
          const prof = await api.getProfile();
          setProfile(prof);
          if (prof.fullName || prof.phoneNumber) {
            setUser(prev => prev ? {
              ...prev,
              fullName: prof.fullName || prev.fullName,
              phoneNumber: prof.phoneNumber,
              phone: prof.phoneNumber,
              emailVerifiedAt: prof.emailVerifiedAt || prev.emailVerifiedAt,
              createdAt: prof.createdAt || prev.createdAt,
              households: prof.households || prev.households,
              householdMembers: prof.householdMembers || prev.householdMembers
            } : null);
          }
        } catch {
          // If profile fails, base user is still valid
        }
      } else {
        setUser(null);
        setProfile(null);
        setMemberships([]);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res?.user) {
        setUser(res.user);
      }
      await refreshUser();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    return api.register(data);
  };

  const updateProfile = async (data: { fullName?: string; phoneNumber?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(prev => prev ? {
      ...prev,
      fullName: updated.fullName || prev.fullName,
      phoneNumber: updated.phoneNumber,
      phone: updated.phoneNumber
    } : null);
    setProfile((prev: any) => ({ ...(prev || {}), ...updated }));
    return updated;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setMemberships([]);
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/login?logged_out=1';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        memberships,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile
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
