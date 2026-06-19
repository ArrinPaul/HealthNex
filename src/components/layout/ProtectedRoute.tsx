"use client";

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('callbackUrl', window.location.pathname);
      router.push(url.pathname + url.search);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      if (user.role === 'public') {
        router.push('/education');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}