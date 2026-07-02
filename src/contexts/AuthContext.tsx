"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { UserRole as ConvexUserRole } from '../../convex/roles';
export type UserRole = ConvexUserRole;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  verificationStatus: string;
  requestedRole?: string;
  onboardingCompleted?: boolean;
  dateOfBirth?: string;
  gender?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    state?: string;
    district?: string;
  };
  bloodGroup?: string;
  medicalConditions?: string[];
  occupation?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole, location: string, verificationDoc?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // In a real app, you might want to fetch the token from a secure cookie 
          // but since we need it for Convex calls (client-side), we'll expect it from the API
          // for this demonstration or store it in localStorage if acceptable.
          // For now, let's assume /api/auth/me can return the token too or we use the cookie.
          if (data.token) setToken(data.token);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }

      const userData = await response.json();
      const loggedInUser: User = userData.user;
      const authToken = userData.token;
      
      setUser(loggedInUser);
      setToken(authToken);
      setIsAuthenticated(true);
      
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, location: string, verificationDoc?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, location, verificationDoc }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Registration failed');
      }

      const userData = await response.json();
      const newUser = userData.user;
      const authToken = userData.token;
      
      setUser(newUser);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated }}>
      {!isLoading && children}
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