"use client";

import { useAuth, UserRole, isAccountApproved } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Paths accessible without auth or without full role checks
const PUBLIC_PATHS = ['/login', '/register', '/onboarding', '/education', '/pending-approval'];

// Admin roles that skip onboarding
const ADMIN_ROLES = ['admin'];

// Roles that can access the main app
const APP_ROLES = ['admin', 'health-worker', 'public-user'];

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowedRolesString = allowedRoles ? allowedRoles.join(',') : '';

  useEffect(() => {
    // Allow public paths without any checks
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return;

    // Not logged in → redirect to login
    if (!isAuthenticated) {
      const url = new URL('/login', window.location.origin);
      url.searchParams.set('callbackUrl', pathname);
      router.push(url.pathname + url.search);
      return;
    }

    if (!user) return;

    // Admins skip onboarding entirely
    const isAdmin = ADMIN_ROLES.includes(user.role);

    // Step 1: Onboarding check — anyone who hasn't completed onboarding (except admins) must go to /onboarding
    if (!isAdmin && !user.onboardingCompleted) {
      if (!pathname.startsWith('/onboarding')) {
        router.push('/onboarding');
        return;
      }
      return; // Allow onboarding page
    }

    // Step 2: If onboarding is done but the account isn't approved yet → pending approval
    if (!isAdmin && user.onboardingCompleted && !isAccountApproved(user)) {
      if (!pathname.startsWith('/pending-approval')) {
        router.push('/pending-approval');
        return;
      }
      return; // Allow pending-approval page
    }

    // Step 3: If completed onboarding and on the onboarding page → redirect to dashboard
    if (user.onboardingCompleted && pathname.startsWith('/onboarding')) {
      router.push('/dashboard');
      return;
    }

    // Step 4: Role-based access for protected routes
    if (allowedRolesString && !allowedRoles?.includes(user.role)) {
      if (!isAccountApproved(user)) {
        if (!pathname.startsWith('/pending-approval')) {
          router.push('/pending-approval');
        }
      } else {
        if (!pathname.startsWith('/dashboard')) {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, allowedRolesString, allowedRoles, router, pathname]);

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Block rendering for users who need onboarding
  if (user && !ADMIN_ROLES.includes(user.role) && !user.onboardingCompleted && !pathname.startsWith('/onboarding')) {
    return null;
  }

  // Block rendering for users waiting for approval
  if (user && !ADMIN_ROLES.includes(user.role) && user.onboardingCompleted && !isAccountApproved(user) && !pathname.startsWith('/pending-approval')) {
    return null;
  }

  return <>{children}</>;
}
