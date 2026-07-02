"use client";

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const PUBLIC_PATHS = ['/login', '/register', '/onboarding', '/education'];

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowedRolesString = allowedRoles ? allowedRoles.join(',') : '';

  useEffect(() => {
    // Allow public paths without auth
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return;

    if (!isAuthenticated) {
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('callbackUrl', pathname);
      router.push(url.pathname + url.search);
      return;
    }

    // Check onboarding — skip for admin/super-admin roles and public role
    if (
      user &&
      user.onboardingCompleted === false &&
      !pathname.startsWith('/onboarding') &&
      user.role !== 'super-admin' &&
      user.role !== 'admin' &&
      user.role !== 'public'
    ) {
      router.push('/onboarding');
      return;
    }

    // If on onboarding but already completed, redirect to dashboard
    if (user && user.onboardingCompleted === true && pathname.startsWith('/onboarding')) {
      router.push('/dashboard');
      return;
    }

    // Role-based access
    if (allowedRolesString && user && !allowedRoles?.includes(user.role)) {
      if (user.role === 'public') {
        router.push('/education');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, allowedRolesString, allowedRoles, router, pathname]);

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Don't render children if user needs onboarding and isn't on the onboarding page
  if (
    user &&
    user.onboardingCompleted === false &&
    !pathname.startsWith('/onboarding') &&
    user.role !== 'super-admin' &&
    user.role !== 'admin' &&
    user.role !== 'public'
  ) {
    return null;
  }

  return <>{children}</>;
}
